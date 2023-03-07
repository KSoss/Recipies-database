const { Pool } = require('pg');
const pool = require('./dbConn');

console.log('Dropping tables...');
pool.query(`DROP TABLE IF EXISTS recipes_tags, recipes_ingredients, tags, recipes, ingredients CASCADE;`, (err, res) => {
  if (err) {
    console.log('Error dropping tables:', err);
  } else {
    console.log('Tables dropped!');
    setTimeout(() => {
      console.log('Creating tables...');
      pool.query(`CREATE TABLE ingredients (
        id SERIAL PRIMARY KEY,
        ingredient TEXT NOT NULL
      )`, (err, result) => {
        if (err) {
          console.error('Error making ingredients:', err);
        } else {
          console.log('ingredients in!!');
        }
      });
      
      pool.query(`CREATE TABLE recipes (
        id SERIAL PRIMARY KEY,
        recipe TEXT NOT NULL,
        cuisine TEXT NOT NULL
      )`, (err, result) => {
        if (err) {
          console.error('Error making recipes:', err);
        } else {
          console.log('recipes in!!');
        }
      });
      
      pool.query(`CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        tag TEXT NOT NULL
      )`, (err, result) => {
        if (err) {
          console.error('Error making tags:', err);
        } else {
          console.log('tags in!');
        }
      });
    }, 2000);
    setTimeout(() => {
      console.log('Creating join tables...');
      pool.query(`CREATE TABLE recipes_ingredients (
        id SERIAL PRIMARY KEY,
        recipes_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        ingredients_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE
      )`, (err, result) => {
        if (err) {
          console.error('Error making recipes_ingredients:', err);
        } else {
          console.log('recipes_ingredients in!!');
        }
      });
      
      pool.query(`CREATE TABLE recipes_tags (
        id SERIAL PRIMARY KEY,
        recipes_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        tags_id INTEGER REFERENCES tags(id) ON DELETE CASCADE  
      )`, (err, result) => {
        if (err) {
          console.error('Error making recipes_tags:', err);
        } else {
          console.log('Recipes_tags in!!');
        }
      });
    }, 4000);
  }
});