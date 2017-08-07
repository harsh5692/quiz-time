'use strict';

var Mongoose = require('mongoose');

/**
 * Each connection object represents a user connected through a unique socket.
 * Each connection object composed of {userId + socketId}. Both of them together are unique.
 *
 */
var RoomSchema = new Mongoose.Schema({
  title: { type: String, required: true },
  connections: { type: [{ userId: String, socketId: String }] },
  isOpen: { type: Boolean, default: true },
  owner: { type: { userId: String, socketId: String } },
  rounds: { type: Number, default: 5 },
  currentRound: { type: Number, default: 0 },
  noOfPlayers: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now },
  // questions: { type: Array }
  score: {
    type: [{ round: Number, answers: Object, _id: { id: false } }],
    default: [{ round: 0, answers: {} }]
  }
});

var roomModel = Mongoose.model('room', RoomSchema);

module.exports = roomModel;