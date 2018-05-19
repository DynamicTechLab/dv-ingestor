const express = require('express');

const router = express.Router();
const logger = require('../../logger.js');
const FlightInfoService = require('./flightInfoService.js');
const airportList = require('./airportList.js');

// Check if we can fetch data from yow api
router.get('/', (req, res) => {
  FlightInfoService.requestFlightInfo(airportList.YOW_DEPARTURE)
    .then(resp => {
      logger.debug(`Get response when requests /departure: ${resp}`);
      res.send('OK');
    })
    .catch(err => {
      logger.error(`Get error when requests /departure: ${err}`);
      res.status(500).send('ERROR');
    });
});

module.exports = router;
