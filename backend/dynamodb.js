const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-south-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports = dynamo;