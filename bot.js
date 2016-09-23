'use strict';

const botBuilder = require('claudia-bot-builder');
const excuse = require('huh');
const fs = require('fs');
console.log("Trying to parse data");
var dtree = require('./data/fibi_decision_tree.json');

module.exports = botBuilder(function (message, request) {
  console.log("This is the message", message);
  console.log("This is the request", request);
  console.log(dtree);
  return 'Thanks for sending ' + message.text  + 
      '. Your message is very important to us, but ' + 
      excuse.get() + '. This is production.' + dtree.data[0].copy;
});
