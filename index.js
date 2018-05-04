const express = require('express');
const request = require('request');
const fs = require('fs');
const elasticsearch = require('elasticsearch');

const esClient = require('./esRepo.js');

const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/elastic', function(req, res){
  var requestDemo = request('http://localhost:9200/', { json: true }, (err, resp, body) => {
    if (err) { return console.log(err); }
    console.log(body);
    res.send(body);
  });
});

app.get('/read', function(req, res){
  var fileName = req.query.fileName;
  fs.readFile( __dirname + "/" + fileName + ".json", 'utf8', function (err, rawData) {
    var flights = JSON.parse(rawData).flights;
    var flightArray = [];
    flights.forEach(function(item){
      if (new Date(item.id.match("/(\d{8})/gm")).toDateString()
          == new Date(item.timeScheduled).toDateString()) {
        indexToES(item);
      }

    })
    res.send('OK');
   });
})

function indexToES(flights){
  esClient.index({
    index: 'yow',
    type: 'record',
    id: flights.id,
    body: flights
  },function(err,resp,status) {
      console.log(err);
  });
}

app.listen(3000, () => console.log('Example app listening on port 3000!'));
