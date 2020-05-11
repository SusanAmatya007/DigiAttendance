const express = require("express");
const path = require("path");
const expressHandlebars = require("express-handlebars");
const passport = require("passport");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const handlebars = require('handlebars');

const application = express();

const port = process.env.PORT || 3000

// const config = require("./config");
const passportConfig = require("./config/passport")(passport);

application.use(bodyParser.urlencoded({
    extended : true,
}));

application.use(bodyParser.json());

application.set("views", path.join(__dirname, "/views/"));
application.engine("hbs", expressHandlebars({
    extname : "hbs",
    defaultLayout : "base",
    layoutsDir : __dirname + "/views/layouts"
}));
application.set("view engine", "hbs");
application.use(express.static(path.join(__dirname, "static")));
handlebars.registerHelper("inc", (value, options) => {
    return parseInt(value) + 1;
});

application.use(
    expressSession({
        secret: "secret",
        resave: false,
        saveUninitialized: false
    })
);

application.use(passport.initialize());
application.use(passport.session());

const connection = require("./models");
const controller = require("./controllers");

application.use("/" , controller);

// const { app : { host, port }} = config;
// application.listen(port, host, ()=>{
//     console.log(`Server started at PORT: ${port}`);
// });

// const { app : { port }} = config;
application.listen(port, ()=>{
    console.log(`Server started at PORT: ${port}`);
});