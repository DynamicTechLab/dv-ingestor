const express = require('express');

const esClient = require('../es-client.js');
const logger = require('../logger.js');

const router = express.Router();

// Check if elastic search is alive
router.get('/', (req, res) => {
  esClient
    .info({
      requestTimeout: 3000,
    })
    .then(body => {
      logger.debug('Response: ', body);
      res.send(body);
    })
    .catch(err => {
      logger.error('ElasticSearch is down: ', err);
      res.status(500).send(err);
    });
});
module.exports = router;
