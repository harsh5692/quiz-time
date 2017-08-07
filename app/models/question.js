'use strict';

// var questionModel = require('../database').models.question;

var questionPool = [{
  question: "What is this One?",
  answer: "A",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Two?",
  answer: "B",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Three?",
  answer: "C",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Four?",
  answer: "D",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Five?",
  answer: "C",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}];

var getQuestionNumber = function(num, callback) {
  num = num % questionPool.length;
  return callback(null, questionPool[num]);
}

module.exports = {
  getQuestionNumber
};