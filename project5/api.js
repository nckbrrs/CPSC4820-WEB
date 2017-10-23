// Dependencies
var express = require('express');
var redis = require('redis');
var bluebird = require('bluebird');
var bodyParser = require('body-parser');
var auth = require('basic-auth');

// Bluebird setup
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// Express setup
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Redis setup
var client = redis.createClient();
client.on('error', function(err) {
  console.log('Error in redis client.on ' + err);
});

// Authentication method
var authenticate = function(req)  {
  var credentials = auth(req);
  if (!credentials || credentials.name !== 'teacher' || credentials.pass !== 't1g3rTester!@#') {
    return false;
  }
  return true;
}

// Basic GET request for testing purposes
app.get('/', function(req, res) {
  console.log('received get / request');
  res.send('Hello World!');
});

// Actual API stuff
app.post('/students', function(req, res) {
  console.log('received post /students request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var studentObj = req.body;
  // check for bad request (no body, no username field, or no name field)
  if (studentObj == null ||
      studentObj['username'] == null ||
      studentObj['name'] == null) {
    console.log('--bad request; studentObj is: ', JSON.stringify(studentObj));
    res.status(400);
    res.end();
    return;
  }
  else {
    // check if username already exists in redist "students" set
    client.sismemberAsync('students', `${studentObj['username']}`).then(function(exists) {
      if (!exists) {
        // add new student
        console.log('--creating and adding new student');
        // add _ref field to student object, with value of '/students/USERNAME'
        studentObj['_ref'] = `/students/${studentObj['username']}`;
        // multi() used to execute several redis commands atomically
        client.multi()
          // create a new hashmap for the newly created student called 'student:USERNAME',
          // with the fields and keys located in the studentObj object
          .hmset(`student:${studentObj['username']}`, studentObj)
          // add USERNAME to the 'students' set
          .sadd('students', `${studentObj['username']}`)
          // execute the above redis commands atomically
          .execAsync().then(function(retval) {
            console.log('--successful');
            // send body containing a reference to newly created student
            res.status(200).json({_ref: `${studentObj['_ref']}`});
            return;
          });
      } else {
        // student already exists
        console.log('--student already exists');
        res.status(400);
        res.end();
        return;
      }
    });
  }
});

app.delete('/students/:username', function(req, res) {
  console.log('received delete /students/:username request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var username = req.params.username;
  // ensure that requested username actually exists in set
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      // delete student:USERNAME hash object and remove username from 'students' set
      client.multi()
        .del(`student:${username}`)
        .srem('students', username)
        .execAsync().then(function(retval) {
          console.log('--student deleted');
          res.status(200);
          res.send('student deleted');
          return;
        });
    } else {
      // student does not exist
      console.log('--student does not exist');
      res.status(404);
      res.end();
      return;
    }
  });
});

app.patch('/students/:username', function(req, res) {
  console.log('received patch /students/:username request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var username = req.params.username;
  var newStudentObj = {};
  var fields = ['name'];

  // check for bad request (no body, or no name field, or has username field)
  if (newName == null || req.body['username'] != null) {
    console.log('--bad request; req.body is: ', JSON.stringify(req.body));
    res.status(400);
    res.end();
    return;
  }

  for (var field in fields) {
    if (req.body[field[fields]] != null) {
      newStudentObj[field[fields]] = req.body[field[fields]];
    }
  }

  // ensure that requested student actually exists in set
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      // modify student's name key
      client.hmsetAsync(`student:${username}`, newStudentObj).then(function(retval) {
        console.log('--student with username ', username, '\'s name changed to ', newName);
        res.status(200);
        res.send('student name changed');
        return;
      });
    } else {
      // student does not exist
      console.log('--student does not exist');
      res.status(404);
      res.end();
      return;
    }
  });
});

app.get('/students/:username', function(req, res) {
  console.log('received get /students/:username request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var username = req.params.username;
  // ensure that requested student actually exists in set
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      // get student
      client.hgetallAsync(`student:${username}`).then(function(studentObj) {
        console.log('--got student');
        res.status(200).json(studentObj);
        return;
      });
    } else {
      // student does not exist
      console.log('--student does not exist');
      res.status(404);
      res.end();
      return;
    }
  });
});

app.get('/students', function(req, res) {
  console.log('received get /students request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  client.smembersAsync('students').then(function(students) {
    var gottenStudents = [];
    var currentUsername = null;

    for (var i = 0; i<students.length; i++) {
      currentUsername = students[i];
      gottenStudents.push(client.hgetallAsync(`student:${currentUsername}`));
    }
    Promise.all(gottenStudents).then(function(listToSend) {
      res.status(200).json(listToSend);
      return;
    });
  });
});

// GRADES

app.post('/grades', function(req, res) {
  console.log('received post /grades request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var gradeObj = req.body;
  // check for bad request (no body, no username, no type, no max, or no grade)
  if (gradeObj == null ||
      gradeObj['username'] == null ||
      gradeObj['type'] == null ||
      gradeObj['max'] == null ||
      gradeObj['grade'] == null) {
    console.log('--bad request; gradeObj is: ', JSON.stringify(gradeObj));
    res.status(400);
    res.end();
    return;
  }
  else {
    // look at current members in 'grades' set, and find most recent (highest) id
    // set newGradeId to be one higher than most recently created grade's id
    var newGradeId = null;
    client.smembersAsync('grades').then(function(grades) {
      console.log(grades);
      if (grades.length == 0) {
        newGradeId = 0;
        console.log('newGradeId: ', newGradeId);
      } else {
        newGradeId = parseInt(grades[grades.length-1]) + 1;
        console.log('newGradeId: ', newGradeId);
      }

      // add '_ref' field to grade object
      console.log('--creating and adding new grade');
      gradeObj['_ref'] = `/grades/${newGradeId}`;

      // multi() used to execute several redis commands atomically
      client.multi()
        // create a new hashmap for the newly created grade called 'grade:ID',
        // with the fields and keys located in the gradeObj object
        .hmset(`grade:${newGradeId}`, gradeObj)
        // add ID to the 'grades' set
        .sadd('grades', `${newGradeId}`)
        // execute the above redis commands atomically
        .execAsync().then(function(retval) {
          console.log('--successful');
          // send body containing a reference to the newly created grade
          res.status(200).json({_ref: `${gradeObj['_ref']}`});
          return;
        });
      });
    }
});

app.get('/grades/:gradeid', function(req, res) {
  console.log('received get /grades/:gradeid request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var gradeId = req.params.gradeid;
  // ensure that requested grade actually exists in set
  client.sismemberAsync('grades', gradeId).then(function(exists) {
    if (exists) {
      // get grade
      client.hgetallAsync(`grade:${gradeId}`).then(function(gradeObj) {
        console.log('--got grade');
        res.status(200).json(gradeObj);
        return;
      });
    } else {
      // grade does not exist
      console.log('--grade does not exist');
      res.status(404);
      res.end();
      return;
    }
  })
});

app.patch('/grades/:gradeid', function(req, res) {
  // modify grade
  //return 404 if gradeid doesn't exist
  //return 400 if request body is missing or no keys exist in hash
  //expect hashed array of values to change
  // should only accept changes for max, grade, type, and username
  // if change(s) successful, return a 200 with no body

  console.log('received patch /grades/:gradeid request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var gradeId = req.params.gradeid;
  var newGradeObj = {};
  var fields = ['max', 'grade', 'type', 'username'];

  if (req.body == null ||
      (req.body['max'] == null &&
      req.body['grade'] == null &&
      req.body['type'] == null &&
      req.body['username'] == null)) {
    console.log('--bad request; req.body is: ', JSON.stringify(req.body));
    res.status(400);
    res.end();
    return;
  }

  console.log('--req.body is ', JSON.stringify(req.body));

  for (var field in fields) {
    if (req.body[fields[field]] != null) {
      newGradeObj[fields[field]] = req.body[fields[field]];
      console.log(fields[field], 'not null');
    }
  }

  client.sismemberAsync('grades', gradeId).then(function(exists) {
    if (exists) {
      client.hmsetAsync(`grade:${gradeId}`, newGradeObj).then(function(retval) {
        console.log('--grade with id ', gradeId, `\'s vals changed to `, JSON.stringify(newGradeObj));
        res.status(200);
        res.send('grade vals changed');
        return;
      });
    } else {
      // grade does not exist
      console.log('--grade does not exist');
      res.status(404);
      res.end();
      return;
    }
  });
});

app.delete('/grades/:gradeid', function(req, res) {
  console.log('received delete /grades/:gradeid request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  var gradeId = req.params.gradeid;
  // ensure that requested gradeid actually exists in set
  client.sismemberAsync('grades', gradeid).then(function(exists) {
    if (exists) {
      client.multi()
        // delete grade:ID hash object and remove gradeid from 'grades' set
        .del(`grade:${gradeid}`)
        .srem('grades', gradeId)
        .execAsync().then(function(retval) {
          console.log('--grade deleted');
          res.status(200).send('grade deleted');
          return;
        });
    } else {
      // grade does not exist
      console.log('--grade does not exist');
      res.status(404);
      res.end();
      return;
    }
  });
});

app.get('/grades', function(req, res) {
  console.log('received get /grades request');
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  client.smembersAsync('grades').then(function(grades) {
    var gottenGrades = [];
    var currentGradeId = null;

    for (var i = 0; i < grades.length; i++) {
      currentGradeId = grades[i];
      console.log('--currentGradeId', currentGradeId);
      gottenGrades.push(client.hgetallAsync(`grade:${currentGradeId}`));
    }
    Promise.all(gottenGrades).then(function(listToSend) {
      if (req.query.username) {
        console.log('--filtering by username');
        listToSend = listToSend.filter(function(grade) {
          return grade.username === req.query.username;
        });
      }
      if (req.query.type) {
        console.log('--filtering by type');
        listToSend = listToSend.filter(function(grade) {
          return grade.type === req.query.type;
        });
      }
      console.log('--listToSend is', JSON.stringify(listToSend));
      res.status(200).json(listToSend);
      return;
    });
  });
});

app.delete('/db', function(req, res) {
  console.log('received delete /db request');
  if (!authenticate(req)) {
    res.status(401).send();
    return;
  }

  client.flushallAsync().then(function() {
    res.status(200).send();
    return;
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})
