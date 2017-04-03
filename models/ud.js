var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;
var udSchema = mongoose.Schema({
    userName: { type: String, required: true},
    deviceName: { type: String, required: true},
    fingerprint: { type: String, required: true },
    stats: {type: String, enum:['owner', 'user'], default: 'user'},
    number: {type: Number}
});

var noop = function() {}

udSchema.pre("save", function(done) {
    var ud = this;
    if (!ud.isModified("fingerprint")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(ud.fingerprint, salt, noop, function(err, hashedFingerprint) {
            if (err) { return done(err); }
            ud.fingerprint = hashedFingerprint;
            done();
        });
    });
});

udSchema.methods.checkFingerprint = function(guess, done) {
    bcrypt.compare(guess, this.fingerprint, function(err, isMatch) {
        done(err, isMatch);
    });
};

var Ud = mongoose.model("Ud", udSchema);
module.exports = Ud;