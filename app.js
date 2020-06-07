const express = require("express");
const path = require("path");
const expressHandlebars = require("express-handlebars");
const passport = require("passport");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const handlebars = require('handlebars');

const app = express();

const port = process.env.PORT || 3000

// const config = require("./config");
const passportConfig = require("./config/passport")(passport);

app.use(bodyParser.urlencoded({
    extended : true,
}));

app.use(bodyParser.json());

app.set("views", path.join(__dirname, "/views/"));
app.engine("hbs", expressHandlebars({
    extname : "hbs",
    defaultLayout : "base",
    layoutsDir : __dirname + "/views/layouts"
}));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "static")));
handlebars.registerHelper("inc", (value, options) => {
    return parseInt(value) + 1;
});

app.use(
    expressSession({
        secret: "secret",
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

const connection = require("./models");
const controller = require("./controllers");

app.use("/" , controller);

// const { app : { host, port }} = config;
// app.listen(port, host, ()=>{
//     console.log(`Server started at PORT: ${port}`);
// });

// const { app : { port }} = config;
app.listen(port, ()=>{
    console.log(`Server started at PORT: ${port}`);
});