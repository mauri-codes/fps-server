var express         = require("express");
var path            = require("path");

var User            = require("../models/user");
var Link            = require("../models/link");
var Ud              = require("../models/ud");
var Device          = require("../models/device");

var router = express.Router();

router.post("/registerdev", function (req, res) {
    var devicename  = req.body.devicename;
    var pass        = req.body.password;
    var owner       = req.body.owner;
    var username    = req.body.username;
    var newDevice = new Device({
        name: devicename,
        key: pass,
        owner: owner
    });
    newDevice.save();
    var newUD = new Ud({
        userName: owner,
        deviceName: devicename,
        fingerprint: owner + "1",
        stats: "user",
        number: 1
    });
    newUD.save();
    var newUser = new User({
        email: owner,
        name: username
    });
    newUser.save();
    res.json({done: "success", body: req.body});
});

router.post("/uploadlink", function (req, res) {
    var action      = req.body.action;
    var username    = req.body.username;
    var deviceName  = req.body.devicename;

    Link.remove({ userName: username }, function(err) {
        if (err) {
            console.log("error");
        }
    });

    var newLink = new Link({
        userName: username,
        deviceName: deviceName,
        action: action
    });
    newLink.save();
    res.json({done: "success"});

});

module.exports = router;