var express = require('express');
var redis = require('redis');
var bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var app = express();
var databaseClient = redis.createClient();

app.get('/counter/:counterName', function(req, res) {
  databaseClient.incrAsync(req.params.counterName).then(function(counter) {
    res.status(200).json({
      name: req.params.counterName,
      value: counter
    });
  }).catch(function(err) {
    res.status(500).json({error:err});
  });
})

app.patch('/counter/:counterName', (req,res) => {
        databaseClient.setAsync(req.params.counterName,req.body).then(function(worked) {
                if (!worked) {
                        res.status(500).json({error: "something bad"});
                        return;
                }
                res.status(200).end();
        }).catch(function(err){
                //show some error to the client
                res.status(500).json({error: err});
        });
});

app.listen(3000, function () {
  console.log("listening");
});
