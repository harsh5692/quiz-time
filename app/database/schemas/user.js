'use strict';

var Mongoose 	= require('mongoose');
var uuid        = require('uuid');
var bcrypt      = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;
const DEFAULT_USER_PICTURE = "/img/user.jpg";

/**
 * Every user has a username, password, and a picture.
 * 1. User registered via username and password(i.e. LocalStrategy), 
 * 2. Hash user's password
 *
 */
var UserSchema = new Mongoose.Schema({
    username: { type: String, required: true, unique : true},
    password: { type: String, default: null },
    uId: { type: String, default: uuid.v1() },
    picture:  { type: String, default:  DEFAULT_USER_PICTURE}
});

/**
 * Before save a user document, Make sure:
 * 1. User's picture is assigned, if not, assign it to default one.
 * 2. Hash user's password
 *
 */
UserSchema.pre('save', function(next) {
    var user = this;

    // ensure user picture is set
    if(!user.picture){
        user.picture = DEFAULT_USER_PICTURE;
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

/**
 * Create an Instance method to validate user's password
 * This method will be used to compare the given password with the passwoed stored in the database
 * 
 */
UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

// Create a user model
var userModel = Mongoose.model('user', UserSchema);

module.exports = userModel;