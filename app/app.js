require('dotenv').config()
const express = require('express');
const request = require('request');
const fs = require('fs');
const elasticsearch = require('elasticsearch');
const esClient = require('./esClient.js');
const airportList = require('./airportList.js');
const app = express();

// Check if server alive
app.get('/', (request, response) => {
  response.send('Hello World!')
});

app.get('/elasticsearch', function(req, res){
  esClient.info({
    requestTimeout: 3000
  },function(err, resp, status){
    if (err) {
      console.error('Elasticsearch is down');
    } else {
      console.log(resp);
      res.send(resp);
    }
  })
});

app.get('/arrival', function(req, res){
  requestFlightInfo(airportList.YOW_ARRIVAL, function(err, resp) {
    if (err) {
      res.send('ERROR')
    }
    res.send('OK')
  });
});

app.get('/departure', function(req, res){
  requestFlightInfo(airportList.YOW_DEPARTURE, function(err, resp) {
    if (err) {
      res.send('ERROR')
    }
    res.send('OK')
  });
});

app.get('/read', function(req, res){
  var fileName = req.query.fileName;
  fs.readFile( __dirname + "/../test/" + fileName + ".json", 'utf8', function (err, rawData) {
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

function requestFlightInfo(url, callback){
  console.log('Now fetching from ' + url);
  request.get(url, { json: true }, (err, resp, body) => {
    if (err) {
      console.log(err);
      callback(err, resp);
    }
    parseFlightInfo(body);
    callback(err, resp);
  });
}

function parseFlightInfo(body) {
  var flights = body.flights;
  flights.forEach(function(item){
    var date = item.id.match(/(\d{8})/);
    var dateFromId = date[0];
    var dateFromSchedule = formatDate(item.timeScheduled);
    if (dateFromId >= dateFromSchedule) {
      indexToES(item);
    }
  });
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

function indexFlightsStatus(){
  var yow = airportList.yow();
  console.log('Fetching ' + yow.iata + ' flights status at ' + Date.now());
  yow.endpoints.forEach(function(item){
    requestFlightInfo(item, function(err, resp){
      if (err) {
        console.log('Fetching from ' + item + ' error: \n' + err);
      }
    });
  });
}

if (process.env.INDEX_INTERVAL_SWITCH || true) {
  setInterval(indexFlightsStatus, process.env.INDEX_INTERVAL || 1800000);
}

app.set('port', process.env.SERVICE_PORT || 3000);
app.listen(app.get('port'), () => console.log('App listening on port ' + app.get('port') + '!'));
