'use strict';

var config = require('../config');
// var redis = require('redis').createClient;
// var adapter = require('socket.io-redis');

var Room = require('../models/room');
var Question = require('../models/question');
var TIME_INTERVAL = 10000; //25 sec
/**
 * Encapsulates all code for emitting and listening to socket events
 *
 */

var ioEvents = function(io) {

  // Rooms namespace
  io.of('/rooms').on('connection', function(socket) {

    // Create a new room
    socket.on('createRoom', function(title) {
      Room.findOne({ 'title': new RegExp('^' + title + '$', 'i') }, function(err, room) {
        if (err) throw err;
        if (room) {
          socket.emit('updateRoomsList', { error: 'Room title already exists.' });
        } else {
          Room.create({
            title: title
          }, function(err, newRoom) {

            if (err) throw err;
            // send to current socket
            socket.emit('updateRoomsList', newRoom);
            // send to all other sockets
            socket.broadcast.emit('updateRoomsList', newRoom);
          });
        }
      });
    });
  });

  // gameroom namespace
  io.of('/gameroom').on('connection', function(socket) {

    // Join a gameroom
    socket.on('join', function(roomId) {
      Room.findById(roomId, function(err, room) {
        if (err) throw err;
        if (!room) {
          // Assuming that you already checked in router that gameroom exists
          // Then, if a room doesn't exist here, return an error to inform the client-side.
          socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
        } else {
          // Check if user exists in the session
          if (socket.request.session.passport == null) {
            return;
          }
          // check if there is empty seat in the game room
          if (room.currentRound == room.rounds) {
            socket.emit('updateUsersList', { error: 'Game has ended.' });
          } else if (room.noOfPlayers <= room.connections.length) {
            socket.emit('updateUsersList', { error: 'Room is Full. Try again later' });
          } else {
            Room.addUser(room, socket, function(err, newRoom) {

              // Join the room channel
              socket.join(newRoom.id);
              if (newRoom.noOfPlayers == newRoom.connections.length) {
                newRoom.isOpen = false;
                newRoom.save();
                sendQuestion(socket, newRoom.id);
              }

              Room.getUsers(newRoom, socket, function(err, users, cuntUserInRoom) {
                if (err) throw err;

                // Return list of all user connected to the room to the current user
                socket.emit('updateUsersList', users, true);

                // Return the current user to other connecting sockets in the room 
                // ONLY if the user wasn't connected already to the current room
                if (cuntUserInRoom === 1) {
                  socket.broadcast.to(newRoom.id).emit('updateUsersList', users[users.length - 1]);
                }
              });
            });
          }
        }
      });
    });

    // When a socket exits
    socket.on('disconnect', function() {

      // Check if user exists in the session
      if (socket.request.session.passport == null) {
        return;
      }

      // Find the room to which the socket is connected to, 
      // and remove the current user + socket from this room
      Room.removeUser(socket, function(err, room, userId, cuntUserInRoom) {
        if (err) throw err;

        // Leave the room channel
        socket.leave(room.id);

        // Return the user id ONLY if the user was connected to the current room using one socket
        // The user id will be then used to remove the user from users list on gameroom page
        if (cuntUserInRoom === 1) {
          if (room.currentRound >= room.rounds) {
            // delist the quiz  or take score board
            room.isOpen = false;
            room.save();
          } else {
            // room availble for new palyer
            room.isOpen = true;
            room.save();
          }
          socket.broadcast.to(room.id).emit('removeUser', userId);
        }
      });
    });

    // When a new answer arrives
    socket.on('playerAnswer', function(roomId, message) {
      var userId = message.userId;
      var user_answer = message.content;
      var correct_answer = message.correct_answer;

      Room.findById(roomId, function(err, room) {
        if (err) throw err;
        if (!room) {
          socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
        } else {
          // Check if user exists in the session
          if (socket.request.session.passport == null) {
            return;
          }
          if (!room.score[room.score.length - 1].answers) {
            room.score[room.score.length - 1].answers = {};
          }
          if (room.score[room.score.length - 1].answers[userId] == undefined) {
            if (correct_answer == user_answer) {
              room.score[room.score.length - 1].answers[userId] = 3;
            } else {
              room.score[room.score.length - 1].answers[userId] = 0;
            }
            // console.log("before save : ", JSON.stringify(room), room.score[room.score.length - 1].answers, userId);
            room.save();
          }
        }
      });
    });
  });
}

var sendQuestion = function(socket, roomId) {

  Room.findById(roomId, function(err, room) {
    if (err) throw err;
    if (!room) {
      socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
    } else {
      // Check if user exists in the session
      if (socket.request.session.passport == null) {
        return;
      }
      if (room.currentRound >= room.rounds) {
        // delist the quiz  or take score board
        room.isOpen = false;
        room.save();
        socket.emit('endQuiz', room);
        socket.broadcast.to(room.id).emit('endQuiz', room);
      } else {
        Question.getQuestionNumber(room.currentRound, function(err, question) {
          if (err) throw err;

          socket.emit('newRoundData', question);
          socket.broadcast.to(roomId).emit('newRoundData', question);
          timer(socket, roomId);
        });
        // Room.incCurrentRound(room, function(err, newRoom) {});
      }
    }
  });
}

var timer = function(socket, roomId) {
  setTimeout(function() {
    Room.findById(roomId, function(err, room) {
      if (err) throw err;
      if (!room) {
        socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
      } else {
        Room.incCurrentRound(room, function(err, newRoom) {
          if (err) throw err;
          sendQuestion(socket, roomId);
        });
      }
    });
  }, TIME_INTERVAL); //10 sec timeout
}
/**
 * Initialize Socket.io
 * Uses Redis as Adapter for Socket.io
 *
 */
var init = function(app) {

  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  // Force Socket.io to ONLY use "websockets"; No Long Polling.
  io.set('transports', ['websocket']);

  // Allow sockets to access session data
  io.use((socket, next) => {
    require('../session')(socket.request, {}, next);
  });

  // Define all Events
  ioEvents(io);

  // The server object will be then used to list to a port number
  return server;
}

module.exports = init;