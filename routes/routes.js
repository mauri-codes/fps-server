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

    Link.remove({$or: [{ userName: username }, {deviceName: deviceName}]}, function(err) {
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
//checking device password
router.post("/deviceconf", function (req, res, next) {
    var password = req.body.pass;
    var deviceName  = req.body.devicename;
    Device.findOne({
        name: deviceName
    }, function (err, dev) {
        if(err) res.json({success: false, message: err});
        if(!dev) res.json({success: false, message: "bad devname"});
        else{
            dev.checkKey(password, function (err, isMatch) {
                if(isMatch){
                    next();
                }else{
                    res.json({success: false, message: "bad key"});
                }
            })
        }
    });
});

router.post("/deviceconf", function (req, res) {
    var deviceName  = req.body.devicename;
    var fingerprint = req.body.fingerprint;
    var action      = req.body.action;
    var status      = "";
    Device.findOne({name: deviceName}, function (err, dev) {
        if(err) res.json({success: false, message: err});
        Link.findOne({
            deviceName: deviceName,
            status: "waiting"
        }, function (err, link) {
            if(err) res.json({success: false, message: err});
            if(!link)
                res.json({success: false, message: "no request"});
            else{
                if(action == "register"){
                    if(link.action == "registerdev"){
                        if(!dev)
                            status = "register dev";
                        else
                            status = "used device";
                    }else if(link.action == "register"){
                        if(!dev)
                            status = "no device";
                        else
                            status = "register user";
                    }else
                        status = "incorrect mode";
                }else{
                    if(link.action == "log")
                        status = "log user";
                    else
                        status = "incorrect mode";
                }
                Link.findOneAndUpdate(
                    {deviceName: deviceName, status: "waiting"},
                    {status: status, fing: fingerprint}, //change to this if found
                    function (err, link2) {
                        if(err) res.json({success: false, message: err});
                        else    {
                            res.json({success: true});
                        }
                    }
                );
            }
        });
    })
});


//checks if register is done by the device
router.post("/reg_done", function (req, res) {
    var deviceName  = req.body.devicename;
    Link.findOne({deviceName: deviceName}, function (err, link) {
        if(err){ res.json({success: false, message: err});}
        if(!link){res.json({success: false});}
        else{
            res.json({success: true, status: link.status, fing: link.fing});
        }
    });
});

router.post("/reg_user", function (req, res) {
    var name  = req.body.name;
    var email = req.body.email;
    var devicename = req.body.devicename;
    var fingerprint = req.body.fingerprint;
    var newUD = new Ud({
        userName: email,
        deviceName: devicename,
        fingerprint: email + fingerprint,
        stats: "user",
        number: fingerprint
    });
    newUD.save();
    var newUser = new User({
        email: email,
        name: name
    });
    newUser.save();
    res.json({done: "success"});
});
module.exports = router;