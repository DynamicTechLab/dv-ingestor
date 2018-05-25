require('dotenv').config();

// Frameworks
const express = require('express');

// Component
const FlightInfoService = require('./components/flightinfo/flightInfoService.js');
const airportList = require('./components/flightinfo/airportList.js');

const app = express();
const shouldAutoFetch = process.env.INDEX_INTERVAL_SWITCH || true;

const indexRouter = require('./index.js');
const esStatusApi = require('./components/elasticsearch/esStatusApi.js');
const arrivalApi = require('./components/flightinfo/arrivalApi.js');
const departureApi = require('./components/flightinfo/departureApi.js');
const readFromLocalApi = require('./components/flightinfo/readFromLocalApi.js');

app.use('/', indexRouter);
app.use('/elasticsearch', esStatusApi);
app.use('/arrival', arrivalApi);
app.use('/departure', departureApi);
app.use('/read', readFromLocalApi);

if (shouldAutoFetch) {
  setInterval(() => {
    FlightInfoService.indexFlightsStatus(airportList.yow());
  }, process.env.INDEX_INTERVAL || 1800000);
}

module.exports = app;
