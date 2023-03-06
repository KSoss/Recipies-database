const { Pool } = require('pg');
const pool = require('./dbConn');

pool.query(
    `CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );`
  );
  
  pool.query(
    `CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL
    );`
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      tag TEXT NOT NULL
    );`
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS recipes_ingredients (
        recipes_id INTEGER NOT NULL REFERENCES recipes(id),
        ingredients_id INTEGER NOT NULL REFERENCES ingredients(id)
    );`
  );
  
  pool.query(
    `CREATE TABLE IF NOT EXISTS recipes_tags (
        recipes_id INTEGER NOT NULL REFERENCES recipes(id),
        tags_id INTEGER NOT NULL REFERENCES tags(id)
    );`
  );
  
  //promise to potentially handle node errors
  
  process.on('unhandledRejection', error => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
  });