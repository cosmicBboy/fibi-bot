const data = require('./data/json/decision_tree_data.json');

const http = require('http');
const inquirer = require('inquirer');
const express = require("express");
const _ = require("underscore");
const app = express();
const port = 8080;
const host = "localhost";
const debugLevel = process.env.DEBUG;

const initConvoOptions = {
  host: host,
  path: "/hello",
  port: port
}

const endConvoOptions = {
  host: host,
  path: "/goodbye",
  port: port
}

app.use((request, response, next) => {
  // in case you want to log stuff about the request
  next()
});

app.use((request, response, next) => {
  // in case you want to add data to the request
  // request.data = "add data";
  next()
});

app.get("/hello", (request, response) => {
  inquirer.prompt([mainMenu()]).then((answers) => {
    // console.log("answers:", answers, "\n");
    http.get(getNextConvoRequest(answers.choice));
  });
  response.send("Starting conversation on the server...\n");
});

app.get("/hello/question/:id", (request, response) => {
  // console.log("params:", request.params);
  request.socket.on("error", function() {
    console.log("an error!");
  });

  var itemData = findItem(request.params.id),
      prompt,
      convItem,
      nextRequestOpts;

  // get data for this convoItem to format the prompt
  prompt = convoItemToPrompt(itemData);
  console.log("\n", prompt.info);
  consoleDebug("itemData", itemData);
  consoleDebug("prompt", prompt.promptObj);
  inquirer.prompt([prompt.promptObj]).then((answers) => {
    // console.log("what was my response?", answers, "\n");
    if (answers.choice == "END") {
      nextRequestOpts = endConvoOptions;
    } else if (answers.choice === "START_OVER") {
      nextRequestOpts = initConvoOptions;
    } else {
      nextRequestOpts = getNextConvoRequest(answers.choice);
    }
    http.get(nextRequestOpts);
  });
  response.send("Continuing conversation on the server...\n");
});

app.get("/goodbye", (request, response) => {
  console.log("Goodbye!\n");
  response.send("Ending conversation...\n");
  process.exit();
});

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err)
  }
  // Welcome Message
  console.log(`server is listening on ${port}\n`);
  console.log("Hi! I'm Fibi. You can talk to me here!");
  console.log("I can try to help you find resources to support");
  console.log("obtaining legal status, a drivers license, or scholarships.\n");

  // no callback function provided here. For some reason, it was causeing
  // the question text to be displayed twice
  http.get(initConvoOptions);
});

function mainMenu() {
  return {
    type: "list",
    name: "choice",
    message: "What find of support are you interested in?",
    choices: [
      {
        name: "legal status",
        value: "1",
        short: "legal_status"
      },
      {
        name: "driver's license",
        value: "62",
        short: "drivers_license"
      },
      {
        name: "scholarships",
        value: "54",
        short: "scholarships"
      }
    ]
  }
}

function convoItemToPrompt(convoItemData) {
  // takes convoItemMetadata to format a prompt to initiate next convo item
  // console.log("itemData", convoItemData);
  var pointsTo = convoItemData.pointsTo,
      choices;

  // The
  if (pointsTo[0] == "START_OVER" | pointsTo[0] == "" | !pointsTo[0]) {
    choices = [formatStartOverChoice(), formatEndChoice()]
  } else {
    choices = formatPromptChoices(convoItemData.pointsTo)
  }

  var result = {
    info: convoItemData.blurb,
    promptObj: {
      type: "list",
      name: "choice",
      message: convoItemData.copy,
      choices: choices
    }
  }

  consoleDebug("result", result);
  return result;
}

function formatPromptChoices(idArray) {
  var choices = findChoices(idArray),
      formattedChoices;
  // console.log("prompt choices", choices);
  // here we assume that pointsTo only has one value in the array. All choices
  // should point to only one item
  formattedChoices = _.map(choices, obj => {
    var pointsTo = obj.pointsTo[0],
        res;
    if (pointsTo === "START_OVER" | pointsTo == "") {
      res = formatStartOverChoice()
    } else if (pointsTo === "END") {
      res = formatEndChoice()
    } else {
      res = {
        name: obj.copy,
        value: obj.pointsTo[0],
        short: obj.copy
      }
    }
    return res;
  })

  return formattedChoices;
}

function formatStartOverChoice() {
  return {
    name: "start over",
    value: "START_OVER",
    short: "start_over"
  }
}

function formatEndChoice() {
  return{
    name: "end chat",
    value: "END",
    short: "end_chat"
  }
}

function createConvoItemUrl() {
  return {
    host: host,
    path: "/hello/question/",
    port: port
  }
}

function getNextConvoRequest(choice) {
  var convoItem = createConvoItemUrl();
  convoItem.path = convoItem.path + choice;
  return convoItem;
}

// data query and manipulation helpers
function findItem(id) {
  return _.find(data, o => {
      return o.id === id;
  });
}
function findChoices(idArray) {
  return _.filter(data, o => { return _.contains(idArray, o.id); });
}

// TODO: Implement debug mode
function consoleDebug() {
  if (debugLevel == "1") {
    console.log.apply(null, Array.from(arguments));
  }
}
