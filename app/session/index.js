'use strict';

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var db = require('../database');
var config = require('../config');

/**
 * Initialize Session
 * Uses MongoDB-based session store
 *
 */
var init = function() {

  return session({
    secret: config.sessionSecret,
    resave: false,
    unset: 'destroy',
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db.Mongoose.connection })
    //for persisitant logins between app restart.
  });
}

module.exports = init();