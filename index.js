const express = require("express");
const bodyParser = require("body-parser");
const passPort = require("passport");
const localStrategy = require("passport-local").Strategy;
const session = require("express-session");
const fs = require("fs");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "mysecret",
    cookie: {
        maxAge: 1000 * 60 * 5
    }
}));
app.use(passPort.initialize());
app.use(passPort.session());

app.get("/", (req, res) => res.render("index"));

app.route("/login")
    .get((req, res) => res.render("login"))
    .post(passPort.authenticate('local', {
        failureRedirect: "/login",
        successRedirect: "/loginOK"
    }));
app.get("/loginOK", (req, res) => res.send("Login thanh cong"));

app.get("/private", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("welcome to private");
    }
    else {
        res.send("vui long login");
    }
});
passPort.use(new localStrategy(
    (username, password, done) => {
        fs.readFile("./userDB.json", (err, data) => {
            // console.log("lammmm", data);
            const db = JSON.parse(data);

            const usrRecord = db.find(u => u.usr == username);

            if (usrRecord && usrRecord.pwd == password) {
                return done(null, usrRecord);
            }
            else {
                return done(null, false);
            }
        });
    }
));
passPort.serializeUser((user, done) => {
    done(null, user.usr);
});
passPort.deserializeUser((name, done) => {
    fs.readFile("./userDB.json", (err, data) => {
        const db = JSON.parse(data);
        const userRecord = db.find(u => u.usr == name);
        if (userRecord)
            return done(null, userRecord);
        return done(null, false);
    });
});
app.listen(3000, () => console.log("Server da chay"));