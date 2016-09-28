'use strict';

const rp = require('minimal-request-promise');
const _ = require('underscore');
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;

console.log("Attempting to parse data");
const dtree = require('./data/fibi_decision_tree.json');
const data = dtree.data;

function mainMenu() {
  // TODO: The logic for figuring out with question is next should be done
  // here by finding the pointsTo field in each of the inputs. In the case
  // below, the .addButton calls contain the data for `input` types.
  return new fbTemplate.generic()
    .addBubble(`What kind of support are you interested in dude?`)
      .addButton("legal status", "1 question")
      .addButton("scholarships", "1 question")
      .addButton("health care", "1 question")
    .get();
}

function questionTemplate(questionObj) {
  console.log("This is the current question:", questionObj);
  var inputIds = questionObj.pointsTo;
  var inputs = _.filter(data, o => { return _.contains(inputIds, o.id); });
  console.log("These are the inputIds:", inputIds);
  console.log("These are the inputs:", inputs);

  if (inputs[0].type === "END") {
    return inputs[0].copy;
  } else {
    var message = new fbTemplate.generic()
      .addBubble(questionObj.copy);

    _.each(inputs, input => {
      // Assume that input can only point to one question
      var nextId = input.pointsTo[0];
      console.log("Points to:", nextId);
      var nextQuestion = _.find(data, o => { 
        return o.id === nextId;
      });
      console.log("Next Question:", nextQuestion);
      var text = `${nextQuestion.id} ${nextQuestion.type}`;
      console.log("This is a single input:", input);
      console.log("Copy:", input.copy);
      console.log("Request text:", text);
      message.addButton(input.copy, text);
    });
    return message.get();
  }

}

const api = botBuilder(function (request, originalApiRequest) {
  console.log("This is the request", JSON.stringify(request));
  console.log(
    "This is the original api request", JSON.stringify(originalApiRequest));
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false;

  if (!request.postback) {
    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`)
      .then(response => {
        console.log("This is the response", JSON.stringify(response));
        var user = JSON.parse(response.body)
        console.log("This is the user", JSON.stringify(user));
        return [
          `Hi ${user.first_name}, I'm FIBI. I'm made for immigrants, by immigrants.`,
          `I can try to help you find resources to support obtaining legal status, scholarships, and health care.`,
          mainMenu()
        ]
      });
  }

  if (_.contains(request.text.split(' '), "question")) {
    var split =  request.text.split(' ');
    var nextId = split[0];
    var nextQuestion = _.find(data, o => { 
      return o.id === nextId;
    });
    console.log("This is the next question:", nextQuestion);
    return questionTemplate(nextQuestion);
  }

  if (_.contains(request.text.split(' '), "link")) {
    var split =  request.text.split(' ');
    var linkId = split[0];
    var link = _.find(data, o => { 
      return o.id === linkId;
    });
    console.log("This is the final link:", link);
    return new fbTemplate.generic()
      .addBubble(link.copy)
        .addButton("Go to website", link.url)
      .get();
  }

});

module.exports = api;
