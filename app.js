var express         = require("express");
var mongoose        = require("mongoose");
var path            = require("path");
var bodyParser      = require("body-parser");
var cookieParser    = require("cookie-parser");

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