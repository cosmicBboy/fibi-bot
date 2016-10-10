'use strict';

const rp = require('minimal-request-promise');
const _ = require('underscore');
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;

const dtree = require('./data/json/decision_tree_data.json');
const data = dtree;

function mainMenu() {
  // TODO: The logic for figuring out with question is next should be done
  // here by finding the pointsTo field in each of the inputs. In the case
  // below, the .addButton calls contain the data for `input` types.
  return new fbTemplate.text(`What kind of support are you interested?`)
      .addQuickReply("Legal Status", "1 question")
      .addQuickReply("Driver's License", "1 question")
      .addQuickReply("Scholarships", "54 question")
    .get();
}

function questionTemplate(questionObj) {
  console.log("This is the current question:", questionObj);
  var inputIds =  questionObj.pointsTo;
  var inputs = _.filter(data, o => { return _.contains(inputIds, o.id); });
  console.log("These are the inputIds:", inputIds);
  console.log("These are the inputs:", inputs);

  //This assumes that the Question will directy point to the end object
  //but now our data is updated so that only an input will point to the end
  if (inputs[0].type === "END") {
    return inputs[0].copy;
  } else {
    var message = new fbTemplate.text(questionObj.copy);

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
      message.addQuickReply(input.copy, text);
    });

    // If object contains blurb, return a list of [blurb, message]
    if (questionObj.blurb.length > 0) {
      return [questionObj.blurb, message.get()];
    } else {
      return message.get();
    }
  }

}

const api = botBuilder(function (request, originalApiRequest) {
  console.log("This is the request", JSON.stringify(request));
  console.log(
    "This is the original api request", JSON.stringify(originalApiRequest));
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false;

  var message = request.originalRequest.message,
      quickReply = undefined,
      payload;

  // if message is defined, then try to grab the quick_reply object
  if (!!message) {
    console.log("Assigning quickReply:", request.originalRequest.message);
    quickReply = message.quick_reply;
  }

  console.log("quick reply:", quickReply);
  console.log("START_OVER", request.text == "START_OVER");
  console.log("quick reply?", !quickReply);
  console.log("request.postback", !request.postback);

  if (request.text == "START_OVER" || !quickReply &&
      !request.postback) {
	var url = `https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`;
    return rp.get(url)
      .then(response => {
        console.log("This is the response", JSON.stringify(response));
        var user = JSON.parse(response.body)
        console.log("This is the user", JSON.stringify(user));

		var intro = [`Hi ${user.first_name}, I'm FIBI. I'm made for immigrants, by immigrants.`,`I can try to help you find resources to support obtaining legal status, scholarships, and health care.`, mainMenu()];
		return intro;
      }).catch(error => {console.log('received error: ' + error);});
  }

  if (!!quickReply) {
    payload = quickReply.payload;
  } else if (!quickReply && request.postback) {
    payload = request.text;
  } else {
    throw "no payload!";
  }

  console.log("This is the payload", payload);

  if (_.contains(payload.split(' '), "END")) {
    var split =  payload.split(' ');
    var endObjectId = split[0];
    var endObject = _.find(data, o => {
      return o.id === endObjectId;
    });
    console.log("This is the next object:", endObject);
    return endObject.copy;
  }

  if (_.contains(payload.split(' '), "question")) {
    var split =  payload.split(' ');
    var nextId = split[0];
    var nextQuestion = _.find(data, o => {
      return o.id === nextId;
    });
    console.log("This is the next question:", nextQuestion);
    return questionTemplate(nextQuestion);
  }

  if (_.contains(payload.split(' '), "link")) {
    var split =  payload.split(' ');
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
