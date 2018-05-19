const requestPromise = require('request-promise-native');

const logger = require('../../logger.js');
const Dates = require('../../util/dates.js');
const EsService = require('../elasticsearch/esService.js');

class FlightInfoService {
  static parseFlightInfo(body, handler) {
    // Object deconstructing, get body.flight into array
    const { flights } = body;
    const indexPromises = [];
    // Based on the thread, try to use for loop when possible
    // https://stackoverflow.com/questions/43821759/why-array-foreach-is-slower-than-for-loop-in-javascript?
    // utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    for (let i = 0, len = flights.length; i < len; i += 1) {
      const item = flights[i];
      const date = item.id.match(/(\d{8})/);
      const dateFromId = date[0];
      const dateFromSchedule = Dates.formatDate(item.timeScheduled);
      if (dateFromId >= dateFromSchedule) {
        indexPromises.push(handler(item));
      }
    }
    return indexPromises;
  }

  static requestFlightInfo(url, handler = item => EsService.indexToES(item)) {
    logger.debug(`Now fetching from ${url}`);
    return requestPromise({
      uri: url,
      json: true,
    })
      .then(body => Promise.all(FlightInfoService.parseFlightInfo(body, handler)))
      .catch(err => logger.error('Get error when fetch the flight info:', err));
  }

  static indexFlightsStatus(airport, handler) {
    logger.debug(`Fetching ${airport.name} flights status at ${Date.now()}`);

    const fetchPromises = [];
    airport.endpoints.forEach(url => {
      const promise = FlightInfoService.requestFlightInfo(url, handler)
        .then(resp => {
          logger.debug(`Fetching data from ${url}: \n${resp}`);
        })
        .catch(err => {
          logger.error(`Error when fetching data from ${url}: \n${err}`);
        });
      fetchPromises.push(promise);
    });

    Promise.all(fetchPromises)
      .then(resp => {
        logger.info(`Fetching data from all endpoints succeed: \n${resp}`);
      })
      .catch(err => {
        logger.error(`Fetching data from all endpoints fails: \n${err}`);
      });
  }
}

module.exports = FlightInfoService;
