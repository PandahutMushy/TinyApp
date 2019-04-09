const bodyParser = require("body-parser");
var express = require("express");
var app = express();
var PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

//Generate a new random 6-digit string for short URLs
function generateRandomString(length) {
    var str = "";
    var characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < length; i++) {
        var randomNum = Math.floor(Math.random() * characters.length);
        str += characters[randomNum];
    }
    return str;
}

// Handle POST requests sent by /urls/new
app.post("/urls", (req, res) => {
    //console.log(req);
    var postURL = req.body.longURL;
    var ranStr = generateRandomString(6);
    urlDatabase[ranStr] = postURL;
    let templateVars = {
      shortURL: ranStr,
        longURL: postURL
    };
    res.render("urls_show", templateVars);
    //res.send("Ok = " + urlDatabase[ranStr]);
});

//Initial/Index page
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

//Form to add a new TinyURL
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

//Get a shortURL by id
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
      shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]
    };
    res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
