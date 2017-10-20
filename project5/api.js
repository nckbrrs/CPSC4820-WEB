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
  console.log('received get / request');
  res.send('Hello World!');
});

app.post('/students', function(req, res) {
  if (!authenticate(req)) {
    res.status(401);
    res.end();
    return;
  }

  console.log('received post /students request');
  var studentObj = req.body;

  // check for bad request (no body, no username field, or no name field)
  if (studentObj == null || studentObj['username'] == null || studentObj['name'] == null) {
    console.log('studentObj is null or no username or name');
    console.log('studentObj is:');
    console.log(JSON.stringify(studentObj));
    res.status(400);
    res.end();
    return;
  }
  else {
    // check if username already exists in redist "students" set
    client.sismemberAsync('students', `${studentObj['username']}`).then(function(exists) {
      if (!exists) {
        console.log('creating and adding new student');
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
          .execAsync().then(function(done) {
            console.log('successful execAsync');
            // send body containing a reference to newly created student
            res.status(200).json({_ref: `${studentObj['_ref']}`});
            return;
          },
          function(err) {
            console.log('error in execAsync');
            res.status(500).send(err);
            return;
          });
      } else {
        console.log('student already exists');
        res.status(400);
        res.end();
        return;
      }
    });
  }
});

// Listen on port 3000
app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})
