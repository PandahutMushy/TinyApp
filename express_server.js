const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const bcrypt = require("bcrypt");
const password = "purple-monkey-dinosaur"; // found in the req.params object
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ signed: false }));
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
    "3F5j7S": { longURL: "http://www.paypal.com", userID: "test" },
    "sfjf2D": { longURL: "http://www.gmail.com", userID: "test" },
    "G4jI9S": { longURL: "http://www.github.com", userID: "test" },
    "3m9d6c": { longURL: "http://www.trello.com", userID: "test" }
};

const users = {
    userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "$2b$10$3G3wJCn64NByJCWSzn7mwOvuKctl5/qUF1PTkUFRcrJMzGfQNfE/m" //purple-monkey-dinosaur
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "$2b$10$D7zANBvl/huqEGbZtTFcH.Ne/D6x9IKatF3wC9IC/Noa4ttIhESXO" //dishwasher-funk
    },
    test: {
        id: "test",
        email: "test@test.test",
        password: "$2b$10$yN1mplGuOkVkXJb9j3BH..hbi1jS17PD9JNHkq51i019LbG3SrqbS" //test
    },
    BSPUvqXR:
     { id: 'BSPUvqXR',
       email: 'test@test.test1',
       password: '$2b$10$kAmM5l8crt5wNyjNPz/H0ub5TuMSf26ROaZrL2YLDakYNuehLuI9q' } //test1
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

//Return user key matching email and password provided
function retrieveUserByEmailPass(email, password, userdb) {
    for (var key in userdb) {
        console.log('Checking ',userdb[key].password, ' = ', bcrypt.compareSync(password, userdb[key].password))
        if (userdb[key].email == email && bcrypt.compareSync(password, userdb[key].password)){
            return userdb[key].id;
        }
    }
}

//Generate a new random 6-digit string for short URLs
function generateRandomString(length) {
    let str = "";
    let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * characters.length);
        str += characters[randomNum];
    }
    return str;
}

//Return URL belonging to the provided user ID
function urlsForUser(userID, urlDB) {
  var cloneDB = {};

  for (var key in urlDB) {
    if (urlDB[key].userID == userID) {
      cloneDB[key] = urlDB[key];
    }
  }
  return cloneDB;
}

//Check if a user exists in users database
function checkUsrExists(email, userdb) {
    for (var key in userdb) {
        if (userdb[key].email == email) {
          return true;
        }
    }
}

// Handle POST registration requests
app.post("/register", (req, res) => {
    let usrIDStr = generateRandomString(8);
    let eml = req.body.email;
    let pwd = bcrypt.hashSync(req.body.password, 10);
    let insertObj = {};

    if (!eml || !pwd) {
        res.body.render("You must specify an email and password!")
        res.redirect("/register");
        return;
    }
    if (checkUsrExists(eml, users)) {
      res.status(400).send("The specified user ID already exists!");
      return;
    }

    insertObj = {
        id: usrIDStr,
        email: eml,
        password: pwd
    };

    users[usrIDStr] = insertObj;
    req.session.user_id = usrIDStr;
    res.redirect("/urls");
});

// Handle POST login requests
app.post("/login", (req, res) => {
    let eml = req.body.email;
    let pwd = req.body.password;
    let usrId = retrieveUserByEmailPass(eml, pwd, users);

    if (!usrId) {
        res.status(400).send("Invalid login credentials!");
        return;
    }
    else if (!checkUsrExists(eml, users)) {
        res.status(400).send("The specified user does not exist!");
        return;
    }
    else if (usrId) {
        req.session.user_id = usrId;
        res.redirect("/urls");
        return;
    }
    else {
        res.status(400).send("[DEBUG] User ID not returned!");
        return;
    }
});

// Handle POST logout requests
app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
});

// Handle POST requests for adding URLs
app.post("/urls", (req, res) => {
    let postURL = req.body.longURL;0
    let ranStr = generateRandomString(6);
    let usrID = req.session.user_id;
    urlDatabase[ranStr] = { "longURL": postURL, "userID": usrID };
    res.redirect("/urls");
});

// Handle POST requests for updating URLs
app.post("/urls/:id", (req, res) => {
    if (!req.session.user_id) {
        res.redirect("/login");
        return;
    }

    if (urlDatabase[req.params.id] && urlDatabase[req.params.id].userID == req.session.user_id) {
        urlDatabase[req.params.id].longURL = req.body.updateURL;
    }
    else {
        res.redirect("/login");
        return;
    }
    res.redirect("/urls");
});

// Handle POST requests for deleting URLs
app.post("/urls/:shortURL/delete", (req, res) => {
    let imgOwnerID = urlDatabase[req.params.shortURL].userID;
    let usrID = req.session.user_id;

    if (req.params.shortURL && urlDatabase[req.params.shortURL] && imgOwnerID == usrID) {
      delete urlDatabase[req.params.shortURL];
    }
    res.redirect("/urls");
});

// Show user registration page
app.get("/register", (req, res) => {
    res.render("urls_register");
});

// Show login page
app.get("/login", (req, res) => {
    res.render("urls_login");
});

// Show Initial/Index page
app.get("/urls", (req, res) => {
    if (!req.session.user_id) {
        res.redirect("/login");
        return;
    }

    let usrURLs = urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = {
        usrObj: users[req.session.user_id],
        urls: usrURLs
    };

    res.render("urls_index", templateVars);
});

// Show form to add a new TinyURL
app.get("/urls/new", (req, res) => {
    let templateVars = {
        usrObj: users[req.session.user_id]
    };

    if (!req.session.user_id) {
      res.redirect("/login");
      return;
    }

    res.render("urls_new", templateVars);
});

// Get a shortURL by id
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        usrObj: users[req.session.user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL
    };

    if (!templateVars.usrObj) {
        res.redirect("/login");
        return;
    }
    res.render("urls_show", templateVars);
});

//Handle short URL requests /u/imageid
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
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