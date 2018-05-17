require('dotenv').config();

const express = require('express');
const rpn = require('request-promise-native');
const fs = require('fs');
const logger = require('./logger.js');
const airportList = require('./airportList.js');
const EsService = require('./es-service.js');

const app = express();
const shouldAutoFetch = process.env.INDEX_INTERVAL_SWITCH || true;

const indexRouter = require('./routes/index');
const esStatusRouter = require('./routes/es-status');

app.use('/', indexRouter);
app.use('/elasticsearch', esStatusRouter);

function indexToES(flight) {
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

function formatDate(dateIn) {
  const date = new Date(dateIn);
  const year = date.getFullYear();
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  return [year, month, day].join('');
}

function parseFlightInfo(body) {
  // Object deconstructing, get body.flight into array
  const { flights } = body;
  const indexPromises = [];
  // Based on the thread, try to use for loop when possible
  // https://stackoverflow.com/questions/43821759/why-array-foreach-is-slower-than-for-loop-in-javascript?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  for (let i = 0, len = flights.length; i < len; i += 1) {
    const item = flights[i];
    const date = item.id.match(/(\d{8})/);
    const dateFromId = date[0];
    const dateFromSchedule = formatDate(item.timeScheduled);
    if (dateFromId >= dateFromSchedule) {
      indexPromises.push(indexToES(item));
    }
  }
  return indexPromises;
  
function requestFlightInfo(url) {
  logger.debug(`Now fetching from ${url}`);
  return rpn({
    uri: url,
    json: true,
  })
    .then(body => Promise.all(new EsService().parseFlightInfo(body)))
    .catch(err => logger.error('Get error when fetch the flight info:', err));
}

// Check if we can fetch data from yow api
app.get('/arrival', (req, res) => {
  requestFlightInfo(airportList.YOW_ARRIVAL)
    .then(resp => {
      logger.debug(`Get response when requests /arrival: ${resp}`);
      res.send('OK');
    })
    .catch(err => {
      logger.error(`Get error when requests /arrival: ${err}`);
      res.status(500).send('ERROR');
    });
});

app.get('/departure', (req, res) => {
  requestFlightInfo(airportList.YOW_DEPARTURE)
    .then(resp => {
      logger.debug(`Get response when requests /departure: ${resp}`);
      res.send('OK');
    })
    .catch(err => {
      logger.error(`Get error when requests /departure: ${err}`);
      res.status(500).send('ERROR');
    });
});

app.get('/read', (req, res) => {
  const { fileName } = req.query;
  fs
    .readFile(`${__dirname}/../test/${fileName}.json`, 'utf8')
    .then(rawData => {
      const { flights } = JSON.parse(rawData);
      flights.forEach(item => {
        const date = item.id.match(/(\d{8})/);
        const dateFromId = date[0];
        const dateFromSchedule = formatDate(item.timeScheduled);
        if (dateFromId >= dateFromSchedule) {
          indexToES(item);
        }
      });
      res.send('OK');
    })
    .catch(err => {
      logger.error(`Get error when reading the file ${fileName}: ${err}`);
      res.send('ERROR');
    });
});

function indexFlightsStatus() {
  const yow = airportList.yow();
  logger.debug(`Fetching ${yow.name} flights status at ${Date.now()}`);

  const fetchPromises = [];
  yow.endpoints.forEach(url => {
    const promise = requestFlightInfo(url)
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

if (shouldAutoFetch) {
  setInterval(indexFlightsStatus, process.env.INDEX_INTERVAL || 1800000);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;

// app.set('port', process.env.SERVICE_PORT || 3000);
// app.listen(app.get('port'), () =>
//   logger.info(`App listening on port ${app.get('port')}!`),
// );
