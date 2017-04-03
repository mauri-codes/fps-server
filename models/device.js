var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;
var deviceSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true },
    description: String,
    owner: {type: String}
});

var noop = function() {}

deviceSchema.pre("save", function(done) {
    var dev = this;
    if (!dev.isModified("key")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(dev.key, salt, noop, function(err, hashedKey) {
            if (err) { return done(err); }
            dev.key = hashedKey;
            done();
        });
    });
});

deviceSchema.methods.checkKey = function(guess, done) {
    bcrypt.compare(guess, this.key, function(err, isMatch) {
        done(err, isMatch);
    });
};

var Device = mongoose.model("Device", deviceSchema);
module.exports = Device;