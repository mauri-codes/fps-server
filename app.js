var express         = require("express");
var mongoose        = require("mongoose");
var path            = require("path");
var bodyParser      = require("body-parser");
var cookieParser    = require("cookie-parser");

var jwt             = require("jsonwebtoken");
var passport        = require("passport")
var config          = require('./main');

var User            = require("./models/user");
var Link            = require("./models/link");
var UD              = require("./models/ud");
var Device          = require("./models/device");
var app = express();

app.use(bodyParser.json());//**  extra  **
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

mongoose.connect("mongodb://localhost:27017/thesisproject");

var routes      = require("./routes/routes");



app.set("port", process.env.PORT || 5010);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

//*********************passport start**********************
app.use(passport.initialize());
require("./passport")(passport);//this is linking to the previous file passport.js

var apiRoutes = express.Router();

apiRoutes.post('/login', function (req, res) {
    var username = req.body.name;
    var password = username + req.body.password;
    console.log("hello world");
    console.log(username);
    UD.findOne({
        userName: username
    }, function (err, user) {
        if(err) console.log(err);
        if(! user){
            res.json({success: false, message: "User not found"});
        }else{
            user.checkFingerprint(password, function (err, isMatch) {
                if(isMatch){
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: 10000
                    });
                    res.json({success: true, token: 'JWT ' + token, role: user.stats});
                }else{
                    res.json({success: false, message: "incorrect fingerprint"});
                }
            })
        }
    })
});
apiRoutes.get("/dash", passport.authenticate("jwt", {session: false}), function (req, res) {
    res.send("it worked user id is: " + req.user._id);
});

app.use(apiRoutes);
//****************************passport end******************************


app.get('/', function (req, res){
    res.json({hi: "world"});
});

app.get('/users', function (req, res) {
    User.find({}).exec(function(err, users){
        if(!err){
            res.json(users);
        }else console.log("error");
    });
});


app.use(routes);

app.listen(app.get("port"), function () {
    console.log("server started on port " + app.get("port"));
});


// ---/swapfile none swap sw 0 0