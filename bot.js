'use strict';

const rp = require('minimal-request-promise');
const botBuilder = require('claudia-bot-builder');
const fibi = require('./src/fibi.js');

const api = botBuilder(function (request, originalApiRequest) {
  console.log("This is the request", JSON.stringify(request));
  console.log(
    "This is the original api request", JSON.stringify(originalApiRequest));
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false;

  var message = request.originalRequest.message,
      quickReply = undefined,
      quickReplyIsStartOver = false,
      payload;

  // if message is defined, then try to grab the quick_reply object
  if (!!message) {
    console.log("Assigning quickReply:", request.originalRequest.message);
    quickReply = message.quick_reply;
    if (!!quickReply && !!quickReply.payload) {
      quickReplyIsStartOver = (quickReply.payload == "START_OVER");
      console.log("quick reply is START_OVER:", quickReplyIsStartOver);
    }
  }

  console.log("quick reply:", quickReply);
  console.log("START_OVER", request.text == "START_OVER");
  console.log("quick reply?", !quickReply);

  if (request.text == "START_OVER" || quickReplyIsStartOver || !quickReply && !request.postback) {
	 var url = `https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`;
	 return rp.get(url)
    .then(response => {
      console.log("This is the response", JSON.stringify(response));
      var user = JSON.parse(response.body)
      console.log("This is the user", JSON.stringify(user));
  		return [
        `Hi ${user.first_name}, I'm Fibi. I'm made for immigrants, by immigrants.`,
        `I can help you find resources for obtaining legal status, a driver's license, or college scholarships.`,
        fibi.mainMenu()
      ];

    }).catch(error => {
      console.log('received error: ' + error);
    });
  }

  if (!!quickReply) {
    payload = quickReply.payload;
  } else if (!quickReply && request.postback) {
    payload = request.text;
  } else {
    throw "no payload!";
  }

  // TODO: payloadList should be split into a list on ','
  var payloadList = payload.split(',');
  if (payloadList.length == 1) {
    payload = payloadList[0];
    console.log("Processing payload with single item:", payload);
    return fibi.singlePayloadTemplate(payload);
  } else if (payloadList.length > 1) {
    console.log("Processing payload with multiple items:", payloadList);
    return fibi.multiPayloadTemplate(payloadList);
  }
});

module.exports = api;
