var express = require('express');
var redis = require('redis');
/*var bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
*/

var app = express();
var client = redis.createClient();


client.on('connection', function() {
  console.log('connected!');
});

client.set("foo", "bar", redis.print);
client.get("foo", function(err, reply) {
  if (err) throw err;
  console.log(reply.toString());
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})
