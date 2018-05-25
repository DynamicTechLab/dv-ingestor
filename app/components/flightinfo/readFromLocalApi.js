const express = require('express');
const fs = require('fs-extra');

const router = express.Router();
const logger = require('../../logger.js');
const EsService = require('../elasticsearch/esService.js');
const FlightInfoService = require('./flightInfoService.js');

// Check if we can fetch data from yow api
router.get('/', (req, res) => {
  const { fileName } = req.query;
  fs
    .readJson(`${__dirname}/../../../test/${fileName}.json`)
    .then(rawData => {
      Promise.all(FlightInfoService.parseFlightInfo(rawData, item => EsService.indexToES(item)))
        .then(resp => {
          logger.debug(`Get response when requests /departure: ${resp}`);
          res.send('OK');
        })
        .catch(err => {
          logger.error(`Get error when parse and index the flight info ${err}`);
        });
    })
    .catch(err => {
      logger.error(`Get error when reading the file ${fileName}: ${err}`);
      res.send('ERROR');
    });
});

module.exports = router;
