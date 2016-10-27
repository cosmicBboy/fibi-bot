"use strict";

const utils = require("./utils.js")
const _ = require('underscore');
const fbTemplate = require('claudia-bot-builder').fbTemplate;

// Define the functions exposed through FibiApi
const FibiApi = {
  mainMenu: function() {
    return new fbTemplate.text(`What kind of support are you interested?`)
        .addQuickReply("Legal Status", "1 question")
        .addQuickReply("Driver's License", "62 question")
        .addQuickReply("Scholarships", "54 question")
      .get();  
  },
  singlePayloadTemplate: function(payload) {
    if (_.contains(payload.split(' '), "END")) {
      return processEndPayload(payload);
    } else if (_.contains(payload.split(' '), "question")) {
      return processQuestionPayload(payload);
    } else if (_.contains(payload.split(' '), "link")) {
      return processLinkPayload(payload);
    }
  },
  multiPayloadTemplate: function(payloadList) {
    // for now assume that this function is to display link results
    var message = new fbTemplate.generic(),
        urlText;
    _.each(payloadList, payload => {
      var linkId = payload.split(' ')[0];
      var link = utils.getRecord(linkId);
      console.log("This is link:", link);
      urlText = getButtonText(link);
      
      // create baseline message
      message.addBubble(link.copy)
        .addButton(urlText, link.url);

      if (link.pointsTo.length > 0) {
        message = addMultiInputBubbles(link.pointsTo, message);
      }
    });
    var result = message.get();
    console.log("This is the link message:",
                result.attachment.payload.elements);
    return result;
  },
  // TODO: expose private functions here based on which functions are to
  // be tested
}

function processEndPayload (payload) {
  var endObject = utils.getRecord(payload.split(' ')[0])
  console.log("This is the next END object:", endObject);
  return new fbTemplate.text(endObject.copy)
    .addQuickReply("Chat with me again!", "START_OVER")
    .get();
}

function processQuestionPayload (payload) {
  var nextQuestion = utils.getRecord(payload.split(' ')[0])
  console.log("This is the next question:", nextQuestion);
  return questionTemplate(nextQuestion);
}

function processLinkPayload (payload) {
  var link = utils.getRecord(payload.split(' ')[0]);
  console.log("This is the final link:", link);

  return linkTemplate(link);
}

function getLinkUrlText(linkObj) {
  if (linkObj.urlText.length > 0) {
    return linkObj.urlText;
  } else {
    return "Go to website";
  }
}

function linkTemplate(link) {
  var result;

  // Create baseline message
  var message = new fbTemplate.generic()
    .addBubble(link.copy)
      .addButton(getLinkUrlText(link), link.url);

  // If the link points to anything, then add more bubble buttons
  if (link.pointsTo.length > 0) {
    var linkInputs = utils.getRecords(link.pointsTo)
    console.log("These are the linkInputs:", linkInputs);
    _.each(linkInputs, linkInput => {
      // Assume that input can only point to one question
      var buttonData = getLinkInputButtonData(linkInput);
      message.addButton(buttonData.copy, buttonData.responsePayload);
    });
  }

  result = message.get();
  console.log("This is the response message:",
              result.attachment.payload.elements);
  return prepareResponse(link, message.get());
}

function getLinkInputButtonData(linkInput) {
  var responsePayload;
  if (linkInput.pointsTo[0] == "START_OVER") {
    responsePayload = "START_OVER";
  } else {
    var nextQuestion = utils.getRecord(linkInput.pointsTo[0]);
    console.log("Next Question:", nextQuestion);
    responsePayload = `${nextQuestion.id} ${nextQuestion.type}`
  }
  return {
    copy: linkInput.copy,
    responsePayload: responsePayload
  };
}

function addMultiInputBubbles(linkPointsToList, message) {
  var linkInputs = utils.getRecords(linkPointsToList);
  console.log("These are the linkInputs:", linkInputs);
  _.each(linkInputs, linkInput => {
    // Assume that input can only point to one question
    if (linkInput.pointsTo[0] == "START_OVER") {
      message.addButton(linkInput.copy, "START_OVER");
    } else {
      // Assume that input can only point to one question
      var nextId = linkInput.pointsTo[0];
      var nextQuestion = utils.getRecord(nextId);
      console.log("Next Question:", nextQuestion);
      var text = `${nextQuestion.id} ${nextQuestion.type}`;
      console.log("Request text:", text);
      message.addButton(linkInput.copy, text);
    }
  });
  return message;
}

function formatQuestionTemplate(questionCopy, inputIds) {
  var message = new fbTemplate.text(questionCopy);
  var inputs = utils.getRecords(inputIds),
      pointerPayload,
      nextIds;
  console.log("These are the inputs:", inputs);
  _.each(inputs, input => {
    if (input.type == "link") {
      pointerPayload = `${input.id} ${input.type}`;
    } else {
      pointerPayload = getPointerPayload(input.pointsTo, input, message);
    }
    console.log("pointerPayload:", pointerPayload);
    message.addQuickReply(input.copy, pointerPayload);
  });
  console.log("formatQuestionTemplate output:", message);
  return message.get();
}

function getPointerPayload(nextIds) {
  var responsePayload;
  responsePayload = _.map(nextIds, nextId => {
    return formatPointerPayload(nextId);
  });
  console.log("responsePayload:", responsePayload);
  return responsePayload.join(",");
}

function formatPointerPayload(nextId) {
  var payload;
  if (nextId === "END") {
    payload = "END";
  } else {
    var nextQuestion = utils.getRecord(nextId);
    console.log("Next Question:", nextQuestion);
    payload = `${nextQuestion.id} ${nextQuestion.type}`;
  }
  console.log("Payload:", payload);
  return payload;
}

function questionTemplate(questionObj) {
  console.log("This is the current question:", questionObj);
  var inputIds = questionObj.pointsTo;
  console.log("These are the inputIds:", inputIds);
  var result = formatQuestionTemplate(questionObj.copy, inputIds);
  console.log("This is the FB message.get result:", result);
  return prepareResponse(questionObj, result);
}

function prepareResponse(payloadReqObj, result) {
  // Params:
  //   payloadReqObj: the object obtained by getting the next record in the
  //                  conversation
  //   result:        (fbTemplate object) the output of a *Template function
  if (payloadReqObj.blurb.length > 0) {
    return [payloadReqObj.blurb, result];
  } else {
    return result;
  }
}

function getButtonText(obj) {
  if (obj.urlText.length > 0) {
    return obj.urlText;
  } else {
    return "Go to website";
  }
}

module.exports = FibiApi;
