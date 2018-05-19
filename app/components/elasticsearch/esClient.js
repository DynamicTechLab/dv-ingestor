require('dotenv').config();
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  hosts: process.env.ES_URL || 'http://localhost:9200/',
});

module.exports = client;
