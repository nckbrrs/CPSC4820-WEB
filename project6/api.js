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
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, POST, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
  next();
});

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
app.listen(3001, function() {
  console.log('Server listening on port 3001!');
});

/* POST /students
 - accepts JSON request body with id and name fields
 - creates new hashmap called student:student['id']
 - adds student['id'] to 'students' set
 - if successful, return body containing reference to newly created item
*/
app.post('/students', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  var studentObj = req.body;

  // check for bad request (no body, no id field, or no name field)
  if (studentObj == null || studentObj['id'] == null || studentObj['name'] == null) {
    res.status(400).json({"Status": "Bad request!"});
    return;
  }
  else {
    // ensure that requested id does not already exist
    client.sismemberAsync('students', `${studentObj['id']}`).then(function(exists) {
      if (!exists) {
        client.multi()
          // create new hash for newly created student called 'student:student['id']'
          .hmset(`student:${studentObj['id']}`, studentObj)
          // add student['id'] to 'students' set
          .sadd('students', `${studentObj['id']}`)
          // execute the above commands atomically
          .execAsync().then(function(retval) {
            res.status(200).json(studentObj);
            return;
          });
      } else {
        // student already exists
        res.status(400).json({"Status": "Student already exists!"});
        return;
      }
    });
  }
});

/* GET /students/:id
- no request body
- if successful, returns contents of student:id hash object
*/
app.get('/students/:id', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  var id = req.params.id;

  // ensure that requested id already exists
  client.sismemberAsync('students', id).then(function(exists) {
    if (exists) {
      // get student
      client.hgetallAsync(`student:${id}`).then(function(studentObj) {
        res.status(200).json(studentObj);
        return;
      });
    } else {
      // student does not exist
      res.status(404).json({"Status": "Student does not exist!"});
      return;
    }
  });
});

/* PUT /students/:id
- accepts JSON request body with name field
- modifies students 'name' field
- if successful, returns contents of student:id hash object
*/
app.put('/students/:id', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  var id = req.params.id;
  var newStudentObj = {};

  // check for bad request (no body, or no name field, or has id field)
  if (req.body['name'] == null) {
    res.status(400).json({"Status": "Bad request!"});
    return;
  }

  // set fields of new student object to equal those in the request, and leave the rest alone
  newStudentObj['name'] = req.body['name'];

  // ensure that requested id already exists
  client.sismemberAsync('students', id).then(function(exists) {
    if (exists) {
      // make requested changes to student's values
      client.hmsetAsync(`student:${id}`, newStudentObj).then(function(retval) {
        client.hgetallAsync(`student:${id}`).then(function(studentObj) {
          res.status(200).json(studentObj);
          return;
        });
      });
    } else {
      // student does not exist
      res.status(404).json({"Status": "Student does not exist!"});
      return;
    }
  });
});

/* GET /students
- no request body
- if successful, returns array of contents of all student:id hash objects
*/
app.get('/students', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  // get list of all members of 'students' set
  client.smembersAsync('students').then(function(students) {
    var gottenStudents = [];
    var currentId = null;
    var totalStudents = students.length

    // for each student in 'students', push a promise to gottenStudents
    for (var i = 0; i<students.length; i++) {
      currentId = students[i];
      gottenStudents.push(client.hgetallAsync(`student:${currentId}`));
    }

    Promise.all(gottenStudents).then(function(listToSend) {
      // filter by id if requested
      if (req.query.id) {
        listToSend = listToSend.filter(function(student) {
          return student.id === req.query.id;
        });
      }
      // filter by name if requested
      if (req.query.name) {
        listToSend = listToSend.filter(function(student) {
          return student.name === req.query.name;
        });
      }

      // sort by given attribute if requested
      if (req.query._sort) {
        // if sort query is a valid attribute of grade obj, sort by that attribute
        // otherwise, simply do not sort
        var sortBy = req.query._sort;
        if (sortBy == 'id' || sortBy == 'name') {
          // if order query exists and is 'asc', sort in ascending order
          // otherwise, sort descending
          if (req.query._order == 'ASC') {
            listToSend = listToSend.sort(function(a, b) {
              return (a[`${sortBy}`]).localeCompare(b[`${sortBy}`]);
            });
          } else {
            listToSend = listToSend.sort(function(a, b) {
              return (b[`${sortBy}`]).localeCompare(a[`${sortBy}`]);
            });
          }
        }
      }

      // paginate results
      if (req.query._start || req.query._end) {
        // if no _start query, default _start to 0
        // otherwise, set _start to query value
        if (!req.query._start) {
          var _start = 0;
        } else {
          var _start = req.query._start;
        }

        // if no _end query, check if _limit query exists
        // if so, set _end to _start + _limit
        // if not, set _end to listToSend's length after filtering
        if (!req.query._end) {
          if (req.query._limit) {
            var _end = _start + req.query._limit;
          } else {
            var _end = listToSend.length;
          }
        } else {
          var _end = req.query._end;
        }
        listToSend = listToSend.slice(_start, _end);
      }

      // set headers and send final list of students
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');
      res.set('X-Total-Count', totalStudents);
      res.status(200).json(listToSend);
      return;
    });
  });
});

/* DELETE /students/:id
 - no request body
 - deletes student:id hash object and removes student['id'] from 'students' set
*/
app.delete('/students/:id', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  var id = req.params.id;

  // ensure that requested id already exists
  client.sismemberAsync('students', id).then(function(exists) {
    if (exists) {
      client.multi()
        // delete student:student['id'] hash object
        .del(`student:${id}`)
        // remove student['id]'] from 'students' set
        .srem('students', id)
        // execute the above commands atomically
        .execAsync().then(function(retval) {
          res.status(200).json({"Status": "Student deleted!"});
          return;
        });
    } else {
      // student does not exist
      res.status(404).json({"Status": "Student does not exist!"});
      return;
    }
  });
});

/* POST /grades
- accepts JSON request body with studentId, type, max, and grade fields
- creates new hashmap called grade:ID
- adds ID to 'grades' set
- if successful, return body containing reference to newly created item
*/
app.post('/grades', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  var gradeObj = req.body;

  // check for bad request (no body, no id, no type, no max, or no grade)
  if (gradeObj == null || gradeObj['studentId'] == null || gradeObj['type'] == null ||
      gradeObj['max'] == null || gradeObj['grade'] == null) {
    res.status(400).json({"Status": "Bad request!"});
    return;
  } else {
    var newGradeId = null;

    // find most recent (i.e. highest) id in grades set, and set newGradeId
    client.smembersAsync('grades').then(function(grades) {
      if (grades.length == 0) {
        newGradeId = 0;
      } else {
        newGradeId = parseInt((grades[grades.length-1])) + 1;
      }

      // add 'id' field to new grade object
      gradeObj['id'] = newGradeId.toString();

      client.multi()
        // create a new hashmap for the newly created grade called 'grade:ID'
        .hmset(`grade:${newGradeId}`, gradeObj)
        // add ID to the 'grades' set
        .sadd('grades', `${newGradeId}`)
        // execute the above redis commands atomically
        .execAsync().then(function(retval) {
          res.status(200).json(gradeObj);
          return;
        });
      });
    }
});

/* GET /grades/:gradeid
- no request body
- if successful, returns contents of grades:id hash object
*/
app.get('/grades/:gradeid', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
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
      res.status(404).json({"Status": "Grade does not exist!"});
      return;
    }
  })
});

/* PUT /grades/:gradeid
- accepts JSON request body with id, type, max, and/or grade field(s)
- modifies grade's fields based on fields in request body
- if successful, returns contents of grade:id hash object
*/
app.put('/grades/:gradeid', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  var gradeId = req.params.gradeid;
  var newGradeObj = {};
  var fields = ['max', 'grade', 'type', 'studentId'];

  // check for bad request (no body, or no keys exist in hash)
  if (req.body == null || (req.body['max'] == null && req.body['grade'] == null &&
                          req.body['type'] == null && req.body['studentId'] == null)) {
    res.status(400).json({"Status": "Bad request!"});
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
        client.hgetallAsync(`grade:${gradeId}`).then(function(gradeObj) {
          res.status(200).json(gradeObj);
          return;
        });
      });
    } else {
      // grade does not exist
      res.status(404).json({"Status": "Grade does not exist!"});
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
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  // get list of all members of 'students' set
  client.smembersAsync('grades').then(function(grades) {
    var gottenGrades = [];
    var currentGradeId = null;
    var totalGrades = grades.length

    // for each student in 'grades', push a promise to gottenGrades
    for (var i = 0; i < grades.length; i++) {
      currentGradeId = grades[i];
      gottenGrades.push(client.hgetallAsync(`grade:${currentGradeId}`));
    }
    // when all grades have been gotten, send JSON list of all of them to client
    Promise.all(gottenGrades).then(function(listToSend) {
      // filter by studentId if requested
      if (req.query.studentId) {
        listToSend = listToSend.filter(function(grade) {
          return grade.studentId === req.query.studentId;
        });
      }
      // filter by type if requested
      if (req.query.type) {
        listToSend = listToSend.filter(function(grade) {
          return grade.type === req.query.type;
        });
      }
      // filter by max if requested
      if (req.query.max) {
        listToSend = listToSend.filter(function(grade) {
          return grade.max === req.query.max;
        });
      }
      // filter by grade if requested
      if (req.query.grade) {
        listToSend = listToSend.filter(function(grade) {
          return grade.grade === req.query.grade;
        });
      }
      // sort by given attribute if requested
      if (req.query._sort) {
        // if sort query is a valid attribute of grade obj, sort by that attribute
        // otherwise, simply do not sort
        var sortBy = req.query._sort;
        if (sortBy == 'studentId' || sortBy == 'type' || sortBy == 'max' || sortBy == 'grade') {
          // if order query exists and is 'asc', sort in ascending order
          // otherwise, sort descending
          if (req.query._order == 'ASC') {
            listToSend = listToSend.sort(function(a, b) {
              return (a[`${sortBy}`]).localeCompare(b[`${sortBy}`]);
            });
          } else {
            listToSend = listToSend.sort(function(a, b) {
              return (b[`${sortBy}`]).localeCompare(a[`${sortBy}`]);
            });
          }
        }
      }

      // paginate results
      if (req.query._start || req.query._end) {
        // if no _start query, default _start to 0
        // otherwise, set _start to query value
        if (!req.query._start) {
          var _start = 0;
        } else {
          var _start = req.query._start;
        }

        // if no _end query, check if _limit query exists
        // if so, set _end to _start + _limit
        // if not, set _end to listToSend's length after filtering
        if (!req.query._end) {
          if (req.query._limit) {
            var _end = _start + req.query._limit;
          } else {
            var _end = listToSend.length;
          }
        } else {
          var _end = req.query._end;
        }
        listToSend = listToSend.slice(_start, _end);
      }

      // set headers and send final list of grades
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');
      res.set('X-Total-Count', totalGrades);
      res.status(200).json(listToSend);
      return;
    });
  });
});

/* DELETE /grades/:gradeid
- no request body
- deletes grade:ID hash object and removes ID from 'grades' set
*/
app.delete('/grades/:gradeid', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
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
          res.status(200).json({"Status": "Grade deleted!"});
          return;
        });
    } else {
      // grade does not exist
      res.status(404).json({"Status": "Grade does not exist!"});
      return;
    }
  });
});

/* DELETE /db
- blows away entire database of all data
*/
app.delete('/db', function(req, res) {
  // ensure that client is authorized to make request
  if (!authenticate(req)) {
    res.status(401).json({"Status": "You are not allowed to make this request!"});
    return;
  }

  // clear entire redis database
  client.flushallAsync().then(function() {
    res.status(200).json({"Status": "Database deleted!"});
    return;
  });
});
