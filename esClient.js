require('dotenv').config()
var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: process.env.ES_URL || 'http://localhost:9200/'
});

module.exports = client;
