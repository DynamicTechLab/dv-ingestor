const esClient = require('./esClient.js');
const logger = require('../../logger.js');

class EsService {
  static indexToES(flight) {
    return esClient
      .index({
        index: 'yow',
        type: 'record',
        id: flight.id,
        body: flight,
      })
      .then(body => {
        logger.debug(`Save ${body._id} into ${body._index}`);
      })
      .catch(err => {
        logger.error(err);
      });
  }
}

module.exports = EsService;
