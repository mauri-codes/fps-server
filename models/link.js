var mongoose = require("mongoose");
var linkSchema = mongoose.Schema({
    userName: { type: String},
    deviceName: { type: String},
    status: {type: String, enum:['incorrect mode', 'waiting', 'register dev',
                                 'used device', 'no device', 'register user', 'log user'], default: 'waiting'},
    createdAt: { type: Date, default: Date.now },
    action: { type: String, enum:['register', 'log', 'registerdev']}
});

var Link = mongoose.model("Link", linkSchema);
module.exports = Link;