// -------------------------------
// Import Node Modules
// -------------------------------
require("dotenv").config();
const cors = require("cors");
const Pusher = require("pusher");
const express = require("express");
const bodyParser = require("body-parser");

// ------------------------------
// Create express app
// ------------------------------
const app = express();
// ------------------------------
// Load the middlewares
// ------------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const pusher = new Pusher({
    appId: `${process.env.PUSHER_APP_ID}`,
    key: `${process.env.PUSHER_API_KEY}`,
    secret: `${process.env.PUSHER_API_SECRET}`,
    cluster: `${process.env.PUSHER_APP_CLUSTER}`,
    encrypted: true
});

// -------------------------------
// Create app routes
// -------------------------------
app.post("/update", function(req, res) {
    // -------------------------------
    // Trigger pusher event
    // ------------------------------
    pusher.trigger("events-channel", "new-like", {
        likes : `${req.body.likes}`
    });
});

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  });

app.listen("3120");
console.log("Listening on localhost:3120");