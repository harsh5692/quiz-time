'use strict';

var Mongoose = require('mongoose');

/**
 * Each connection object represents a user connected through a unique socket.
 * Each connection object composed of {userId + socketId}. Both of them together are unique.
 *
 */
var QuestionSchema = new Mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  options: { type: [{ val: String, text: String, _id: { id: false } }] },
  createdAt: { type: Date, default: Date.now }
});

var questionModel = Mongoose.model('question', QuestionSchema);

module.exports = questionModel;


// --------------Add sample questions------------------- 
var add_que = function() {
  var sample = [{
    question: "Question 3 ?",
    answer: "C",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  },{
    question: "Question 4 ?",
    answer: "B",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  },{
    question: "Question 5 ?",
    answer: "D",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  },{
    question: "Question 6 ?",
    answer: "C",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  }];
  questionModel.create(sample, function(err, response) {
    console.log("Create :  ", err, response);
  });
}

// add_que();