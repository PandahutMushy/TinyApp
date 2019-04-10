const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

app.get("/", (req, res) => {
    res.send("Hello!");
});

//Generate a new random 6-digit string for short URLs
function generateRandomString(length) {
    let str = "";
    let characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * characters.length);
        str += characters[randomNum];
    }
    return str;
}

// Handle POST registration requests
app.post("/register", (req, res) => {
    let usrIDStr = generateRandomString(8);
    let eml = req.body.email;
    let pwd = req.body.password;
    let insertObj = {};

    if (!eml || !pwd) {
      res.status(400).send("You must specify an email and password!");
      return;
    }
    if (checkUsrExists(usrIDStr)) {
        res.status(400).send("This user ID already exists in the database!");
        return;
    }

    insertObj = {
      id: usrIDStr,
      email: eml,
      password: pwd
    };

    users[usrIDStr] = insertObj;
    res.cookie("user_id", usrIDStr);

    res.redirect("/urls")
});

// Handle POST login requests
app.post("/login", (req, res) => {
    usrIDStr = req.body.username;
    let pass = req.body.password;
    var usrObj = users[usrIDStr];
    if (usrIDStr in users) {
        if (!users[usrIDStr].password == pass) {
            res.status(400).send("Wrong credentials entered!");
            return;
        }
        res.cookie("user_id", usrObj);
        res.redirect("/urls");
    }
});

// Handle POST logout requests
app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
});

// Handle POST requests for adding URLs
app.post("/urls", (req, res) => {
    let postURL = req.body.longURL;
    let ranStr = generateRandomString(6);
    urlDatabase[ranStr] = postURL;
    res.redirect("/urls");
});

// Handle POST requests for deleting URLs
app.post("/urls/:shortURL/delete", (req, res) => {
    if (req.params.shortURL && urlDatabase[req.params.shortURL])
        delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

// Handle POST requests for updating URLs
app.post("/urls/:id", (req, res) => {
    if (urlDatabase[req.params.id]) {
        urlDatabase[req.params.id] = req.body.updateURL;
    }
    res.redirect("/urls");
});

// Handle GET requests for user registration
app.get("/register", (req, res) => {
    res.render("urls_register");
});

//Initial/Index page
app.get("/urls", (req, res) => {
    console.log("users", users)
    let templateVars = {
        usrObj: users[req.cookies.user_id],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
});

//Form to add a new TinyURL
app.get("/urls/new", (req, res) => {
    let templateVars = {
      usrObj: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
});

//Get a shortURL by id
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        usrObj: users[req.cookies.user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]
    };
    console.log(templateVars)
    res.render("urls_show", templateVars);
});

//Handle short URL requests /u/imageid
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    if (longURL) res.redirect(longURL);
    else {
        let templateVars = {
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

function checkUsrExists (usr) {
    if (usr in users) {
      return true;
    }
    return false;
}
