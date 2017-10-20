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
  if (studentObj == null || studentObj['username'] == null || studentObj['name'] == null) {
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
      // remove username from 'students' set
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
  var newName = req.body['name'];;
  // check for bad request (no body, or no name field, or has username field)
  if (newName == null || req.body['username'] != null) {
    console.log('--bad request; req.body is: ', JSON.stringify(req.body));
    res.status(400);
    res.end();
    return;
  }

  // ensure that requested student actually exists in set
  client.sismemberAsync('students', username).then(function(exists) {
    if (exists) {
      // modify student's name key
      client.hmsetAsync(`student:${username}`, 'name', `${newName}`).then(function(retval) {
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

  var listToSend = [];
  var currentUsername = null;
  client.smembersAsync('students').then(function(studentsList) {
    console.log('--got students');
    console.log('--', studentsList);
    for (i=0; i<studentsList.length; i++) {
      currentUsername = studentsList[i];
      client.hgetallAsync(`student:${currentUsername}`).then(function(studentObj) {
        listToSend.push(studentObj);
      });
    }
    console.log('--sending ', listToSend);
    res.status(200).json(listToSend);
    return;
  });

});

// Listen on port 3000
app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})
