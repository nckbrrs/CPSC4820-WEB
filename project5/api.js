/* Dependencies */
var express = require('express');
var redis = require('redis');
var bluebird = require('bluebird');
var bodyParser = require('body-parser');
var auth = require('basic-auth');

/* Bluebird setup */
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/* Express setup */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

/* Redis setup */
var client = redis.createClient();
client.on('error', function(err) {
  console.log('Error in redis client.on ' + err);
});

/* Authentication method */
var authenticate = function(req)  {
  var credentials = auth(req);
  if (!credentials || credentials.name !== 'teacher' || credentials.pass !== 't1g3rTester!@#') {
    return false;
  }
  return true;
}

/* Listen on port 3000 */
app.listen(3000, function() {
  console.log('Server listening on port 3000!');
});

/* POST /students
 - accepts JSON request body with username and name fields
 - creates new hashmap called student:USERNAME
 - adds USERNAME to 'students' set
 - if successful, return body containing reference to newly created item
*/
app.post('/students', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var studentObj = req.body;

  // check for bad request (no body, no username field, or no name field)
  if (studentObj == null || studentObj['username'] == null || studentObj['name'] == null) {
    res.status(400).send('Bad request!');
    return;
  }
  else {
    // ensure that requested username does not already exist
    client.sismemberAsync('students', `${studentObj['username']}`).then(function(exists) {
      if (!exists) {
        // add _ref field to new student object
        studentObj['_ref'] = `/students/${studentObj['username']}`;

        client.multi()
          // create new hash for newly created student called 'student:USERNAME'
          .hmset(`student:${studentObj['username']}`, studentObj)
          // add USERNAME to 'students' set
          .sadd('students', `${studentObj['username']}`)
          // execute the above commands atomically
          .execAsync().then(function(retval) {
            res.status(200).json({_ref: `${studentObj['_ref']}`});
            return;
          });
      } else {
        // student already exists
        res.status(400).send('Student already exists!');
        return;
      }
    });
  }
});

/* DELETE /students/:username
 - no request body
 - deletes student:USERNAME hash object and removes USERNAME from 'students' set
*/
app.delete('/students/:username', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var username = req.params.username;

  // ensure that requested username already exists
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      client.multi()
        // delete student:USERNAME hash object
        .del(`student:${username}`)
        // remove USERNAME from 'students' set
        .srem('students', username)
        // execute the above commands atomically
        .execAsync().then(function(retval) {
          res.status(200).send('Student deleted!');
          return;
        });
    } else {
      // student does not exist
      res.status(404).send('Student does not exist!');
      return;
    }
  });
});

/* PATCH /students/:username
- accepts JSON request body with name field
- modifies students 'name' field
*/
app.patch('/students/:username', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var username = req.params.username;
  var newStudentObj = {};

  // check for bad request (no body, or no name field, or has username field)
  if (req.body['name'] == null || req.body['username'] != null) {
    res.status(400).send('Bad request!');
    return;
  }

  // set fields of new student object to equal those in the request
  newStudentObj['name'] = req.body['name'];

  // ensure that requested username already exists
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      // make requested changes to student's values
      client.hmsetAsync(`student:${username}`, newStudentObj).then(function(retval) {
        res.status(200).send('Student name changed!');
        return;
      });
    } else {
      // student does not exist
      res.status(404).send('Student does not exist!');
      return;
    }
  });
});

/* GET /students/:username
- no request body
- if successful, returns contents of student:USERNAME hash object
*/
app.get('/students/:username', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var username = req.params.username;

  // ensure that requested username already exists
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      // get student
      client.hgetallAsync(`student:${username}`).then(function(studentObj) {
        res.status(200).json(studentObj);
        return;
      });
    } else {
      // student does not exist
      res.status(404).send('Student does not exist!');
      return;
    }
  });
});

/* GET /students
- no request body
- if successful, returns array of contents of all student:USERNAME hash objects
*/
app.get('/students', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  // get list of all members of 'students' set
  client.smembersAsync('students').then(function(students) {
    var gottenStudents = [];
    var currentUsername = null;

    // for each student in 'students', push a promise to gottenStudents
    for (var i = 0; i<students.length; i++) {
      currentUsername = students[i];
      gottenStudents.push(client.hgetallAsync(`student:${currentUsername}`));
    }
    // when all students have been gotten, send JSON list of all of them to client
    Promise.all(gottenStudents).then(function(listToSend) {
      res.status(200).json(listToSend);
      return;
    });
  });
});

/* POST /grades
- accepts JSON request body with username, type, max, and grade fields
- creates new hashmap called grade:ID
- adds ID to 'grades' set
- if successful, return body containing reference to newly created item
*/
app.post('/grades', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var gradeObj = req.body;

  // check for bad request (no body, no username, no type, no max, or no grade)
  if (gradeObj == null || gradeObj['username'] == null || gradeObj['type'] == null ||
      gradeObj['max'] == null || gradeObj['grade'] == null) {
    res.status(400).send('Bad request!');
    return;
  } else {
    var newGradeId = null;

    // find most recent (i.e. highest) id in grades set, and set newGradeId
    client.smembersAsync('grades').then(function(grades) {
      if (grades.length == 0) {
        newGradeId = 0;
      } else {
        newGradeId = parseInt(grades[grades.length-1]) + 1;
      }

      // add '_ref' field to new grade object
      gradeObj['_ref'] = `/grades/${newGradeId}`;

      client.multi()
        // create a new hashmap for the newly created grade called 'grade:ID'
        .hmset(`grade:${newGradeId}`, gradeObj)
        // add ID to the 'grades' set
        .sadd('grades', `${newGradeId}`)
        // execute the above redis commands atomically
        .execAsync().then(function(retval) {
          res.status(200).json({_ref: `${gradeObj['_ref']}`});
          return;
        });
      });
    }
});

/* GET /grades/:gradeid
- no request body
- if successful, returns contents of student:USERNAME hash object
*/
app.get('/grades/:gradeid', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var gradeId = req.params.gradeid;

  // ensure that requested grade already exists
  client.sismemberAsync('grades', gradeId).then(function(exists) {
    if (exists) {
      // get grade
      client.hgetallAsync(`grade:${gradeId}`).then(function(gradeObj) {
        res.status(200).json(gradeObj);
        return;
      });
    } else {
      // grade does not exist
      res.status(404).send('Grade does not exist!');
      return;
    }
  })
});

/* PATCH /grades/:gradeid
- accepts JSON request body with username, type, max, and/or grade field(s)
- modifies grade's fields based on fields in request body
*/
app.patch('/grades/:gradeid', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var gradeId = req.params.gradeid;
  var newGradeObj = {};
  var fields = ['max', 'grade', 'type', 'username'];

  // check for bad request (no body, or no keys exist in hash)
  if (req.body == null || (req.body['max'] == null && req.body['grade'] == null &&
                          req.body['type'] == null && req.body['username'] == null)) {
    res.status(400).send('Bad request!');
    return;
  }

  // set fields of new grade object to equal those in the request
  for (var field in fields) {
    if (req.body[fields[field]] != null) {
      newGradeObj[fields[field]] = req.body[fields[field]];
    }
  }

  // ensure that requested grade already exists
  client.sismemberAsync('grades', gradeId).then(function(exists) {
    if (exists) {
      // make requested changes to grade's values
      client.hmsetAsync(`grade:${gradeId}`, newGradeObj).then(function(retval) {
        res.status(200).send('Grade\'s values changed!');
        return;
      });
    } else {
      // grade does not exist
      res.status(404).send('Grade does not exist!');
      return;
    }
  });
});

/* DELETE /grades/:gradeid
- no request body
- deletes grade:ID hash object and removes ID from 'grades' set
*/
app.delete('/grades/:gradeid', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  var gradeId = req.params.gradeid;

  // ensure that requested grade already exists
  client.sismemberAsync('grades', gradeId).then(function(exists) {
    if (exists) {
      client.multi()
        // delete grade:ID hash object
        .del(`grade:${gradeId}`)
        // remove ID from 'grades' set
        .srem('grades', gradeId)
        // execute the above commands atomically
        .execAsync().then(function(retval) {
          res.status(200).send('Grade deleted!');
          return;
        });
    } else {
      // grade does not exist
      res.status(404).send('Grade does not exist!');
      return;
    }
  });
});

/* GET /grades
- no request body
- if successful, returns array of contents of all requested grade:ID hash objects
*/
app.get('/grades', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  // get list of all members of 'students' set
  client.smembersAsync('grades').then(function(grades) {
    var gottenGrades = [];
    var currentGradeId = null;

    // for each student in 'grades', push a promise to gottenGrades
    for (var i = 0; i < grades.length; i++) {
      currentGradeId = grades[i];
      gottenGrades.push(client.hgetallAsync(`grade:${currentGradeId}`));
    }
    // when all grades have been gotten, send JSON list of all of them to client
    Promise.all(gottenGrades).then(function(listToSend) {
      // filter by username if requested
      if (req.query.username) {
        listToSend = listToSend.filter(function(grade) {
          return grade.username === req.query.username;
        });
      }
      // filter by type if requested
      if (req.query.type) {
        listToSend = listToSend.filter(function(grade) {
          return grade.type === req.query.type;
        });
      }
      res.status(200).json(listToSend);
      return;
    });
  });
});

/* DELETE /db
- blows away entire database of all data
*/
app.delete('/db', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).send('You are not allowed to make this request!');
    return;
  }

  // clear entire redis database
  client.flushallAsync().then(function() {
    res.status(200).send('Database deleted!');
    return;
  });
});
