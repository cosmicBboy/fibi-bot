const data = require('./data/json/decision_tree_data.json');

const http = require('http');
const inquirer = require('inquirer');
const express = require("express");
const app = express();
const port = 8080;

const initConvoOptions = {
  host: "localhost",
  path: "/hello",
  port: port
}

const getQuestionOptions = {
  host: "localhost",
  path: "/hello/question/1",
  port: port
}

app.use((request, response, next) => {
  // in case you want to log stuff about the request
  // console.info(request.headers)
  console.log("\n");
  next()
});

app.use((request, response, next) => {
  // in case you want to add data to the request
  request.data = "add data";
  next()
});

app.get("/hello", (request, response) => {
  inquirer.prompt([mainMenu()]).then((answers) => {
    http.get(getQuestionOptions, function(res) {
      // go to next question
      console.log("\n");
    });
  });
  response.send("Starting conversation on the server...\n");
});

app.get("/hello/question/:id", (request, response) => {
  console.log("This should go to the next question!");

  inquirer.prompt([nextQuestion()]).then((answers) => {
    http.get(getQuestionOptions, function(res) {
      // go to next question
    });
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err)
  }
  // Welcome Message
  console.log(`server is listening on ${port}\n`);
  console.log("Hi! I'm Fibi. You can talk to me here!");
  console.log("I can try to help you find resources to support");
  console.log("obtaining legal status, a drivers license, or scholarships.");

  // no callback function provided here. For some reason, it was causeing
  // the question text to be displayed twice
  http.get(initConvoOptions);
});

function mainMenu() {
  return {
    type: "list",
    name: "choice",
    message: "What find of support are you interested in?",
    choices: ["legal status", "driver's license", "scholarships"]
  }
}

function nextQuestion() {
  return {
    type: "list",
    name: "choice",
    message: "This is the next question",
    choices: ["input 1", "input 2", "input 3"]
  }
}
