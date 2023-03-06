const http = require('http');
const express = require('express');

const { Pool } = require('pg');
const pool = require('./dbConn');

const app = express();
const port = process.env.PORT || 8000;

//test for front end
app.use(express.static("public"));

// only took 1 hour to realize that this was what would help me to deconstruct my postman requests
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// only took 30 minutes to realize I needed this for front end to reach server. Also NPM instal cors
const cors = require('cors');
app.use(cors());


// listen command
app.listen(port, function() {
  console.log('Listening on port', port);
});

app.get('/recipes', (req, res, next) => {
  pool.query('SELECT * FROM recipes', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});



module.exports = app;