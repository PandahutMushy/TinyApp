const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080;
var usrName = undefined;
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
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * characters.length);
        str += characters[randomNum];
    }
    return str;
}
// Handle POST login requests
app.post("/login", (req, res) => {
    usrName = req.body.username;
    res.cookie("username", usrName);
    let templateVars = {
      username: usrName,
      urls: urlDatabase
    };
    res.redirect("/urls");
});

// Handle POST logout requests
app.post("/logout", (req, res) => {
    res.clearCookie("username");
    usrName = undefined;
    res.redirect("/urls");
});

// Handle POST requests for adding URLs
app.post("/urls", (req, res) => {
    let postURL = req.body.longURL;
    let ranStr = generateRandomString(6);
    urlDatabase[ranStr] = postURL;
    res.redirect("urls/" + ranStr);
});

// Handle POST requests for deleting URLs
app.post("/urls/:shortURL/delete", (req, res) => {
    if (req.params.shortURL && urlDatabase[req.params.shortURL])
        delete urlDatabase[req.params.shortURL];

    res.redirect("/urls");
});

// Handle POST requests for updating URLs
app.post("/urls/:id", (req, res) => {undefined
    if (urlDatabase[req.params.id]) {
        urlDatabase[req.params.id] = req.body.updateURL;
    }
    res.redirect("/urls");
});

//Initial/Index page
app.get("/urls", (req, res) => {
    let templateVars = {
        username: usrName,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
});

//Form to add a new TinyURL
app.get("/urls/new", (req, res) => {
    let templateVars = {
        username: usrName
    };
    res.render("urls_new", templateVars);
});

//Get a shortURL by id
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        username: usrName,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render("urls_show", templateVars);
});

//Handle short URL requests /u/imageid
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    if (longURL) res.redirect(longURL);
    else {
        let templateVars = {
          username: usrName,
          shortURL: req.params.shortURL,
          longURL: undefined
        };
        res.render("urls_show", templateVars);
    }
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
