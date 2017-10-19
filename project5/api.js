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

// Redis setup
var client = redis.createClient();
client.on('error', function(err) {
  console.log('Error in redis client.on ' + err);
});

// Authentication
var authenticate = function(req)  {
  var credentials = auth(req);
  if (!credentials || credentials.name !== 'teacher' || credentials.pass !== 't1g3rTester!@#') {
    return false;
  }
  return true;
}

// Actual API stuff
app.get('/', function(req, res) {
  console.log('basic get');
  res.send('Hello World!');
});

app.post('/students', function(req, res) {
  console.log('post /students');
  var studentObj = req.body;
  if (studentObj == null || studentObj['username'] == null || studentObj['name'] == null) {
    console.log('bad request');
    res.status(400).send();
  } else {
    client.sismemberAsync('students', `${studentObj['username']}`).then(function(exists) {
      if (!exists) {
        console.log('creating and adding new student');
        studentObj['_ref'] = `/students/${studentObj['username']}`;
        client.hmset(`student:${studentObj['username']}`, studentObj);
        client.sadd('students', `${studentObj['username']}`);
        client.execAsync().then(function(done) {
          console.log('successful execAsync');
          res.status(200).json(studentObj);
        },
        function(err) {
          console.log('error in execAsync');
          res.status(500).send(err);
        });
      } else {
        console.log('student exists');
        res.status(400).send();
      }
    });
  }
});

// Listen on port 3000
app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})
