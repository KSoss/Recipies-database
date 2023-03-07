const { Pool } = require('pg');
const pool = require('./dbConn');

pool.query(
  `DROP TABLE IF EXISTS recipes_tags, recipes_ingredients, tags, recipes, ingredients CASCADE;`
);

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
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, ingredient_id)
  );`
);

pool.query(
  `CREATE TABLE IF NOT EXISTS recipes_tags (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
  );`
);
  
  //promise to potentially handle node errors
  
  // process.on('unhandledRejection', error => {
  //   console.error('Unhandled Promise Rejection:', error);
  //   process.exit(1);
  // });