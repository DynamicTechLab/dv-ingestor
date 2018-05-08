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

app.get('/arrival', function(req, res){
  request.get('https://yow.ca/en/flight_info/current?flightType=1', { json: true }, (err, resp, body) => {
    if (err) {
      console.log(err);
      res.send('ERROR');
    }
    parseFlightInfo(body);
    res.send('OK');
   });
});

app.get('/departure', function(req, res){
  request.get('https://yow.ca/en/flight_info/current?flightType=2', { json: true }, (err, resp, body) => {
    if (err) {
      console.log(err);
      res.send('ERROR');
    }
    parseFlightInfo(body);
    res.send('OK');
   });
});

app.get('/read', function(req, res){
  var fileName = req.query.fileName;
  fs.readFile( __dirname + "/" + fileName + ".json", 'utf8', function (err, rawData) {
    if (err) {
      console.log(err);
      res.send('ERROR');
    }
    var flights = JSON.parse(rawData).flights;
    flights.forEach(function(item){
      var date = item.id.match(/(\d{8})/);
      var dateFromId = date[0];
      var dateFromSchedule = formatDate(item.timeScheduled);
      if (dateFromId >= dateFromSchedule) {
        indexToES(item);
      }
    })
    res.send('OK');
   });
});

function parseFlightInfo(body) {
  var flights = body.flights;
  flights.forEach(function(item){
    var date = item.id.match(/(\d{8})/);
    var dateFromId = date[0];
    var dateFromSchedule = formatDate(item.timeScheduled);
    if (dateFromId >= dateFromSchedule) {
      indexToES(item);
    }
  })
}

function indexToES(flights){
  esClient.index({
    index: 'yow',
    type: 'record',
    id: flights.id,
    body: flights
  },function(err,resp,status) {
      console.log(status);
  });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join("");
}

app.listen(3000, () => console.log('Example app listening on port 3000!'));
