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

app.get('/ingredients', (req, res, next) => {
  pool.query('SELECT * FROM ingredients', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

app.get('/tags', (req, res, next) => {
  pool.query('SELECT * FROM tags', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

app.get('/RI', (req, res, next) => {
  pool.query('SELECT * FROM recipes_ingredients', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

app.get('/RT', (req, res, next) => {
  pool.query('SELECT * FROM recipes_tags', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

// needs to be tested
app.get('/everything', (req, res, next) => {

  pool.query(`SELECT r.recipe AS recipe_name, 
  array_agg(DISTINCT i.ingredient) AS ingredients, 
  array_agg(DISTINCT t.tag) AS tags
  FROM recipes r
  LEFT JOIN recipes_ingredients ri ON r.id = ri.recipes_id
  LEFT JOIN ingredients i ON ri.ingredients_id = i.id
  LEFT JOIN recipes_tags rt ON r.id = rt.recipes_id
  LEFT JOIN tags t ON rt.tags_id = t.id
  GROUP BY r.recipe;`, (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  })
})

//Lord forgive me for what I must do

app.post('/recipes', async (req, res) => {
  try {
    const { recipe, cuisine, ingredients, tags } = req.body;

    // Check if the recipe already exists
    const recipeResult = await pool.query('SELECT * FROM recipes WHERE recipe = $1', [recipe]);
    if (recipeResult.rows.length > 0) {
      return res.status(400).send('Recipe already exists');
    }

    // Insert the recipe into the database
    const recipeInsertResult = await pool.query('INSERT INTO recipes (recipe, cuisine) VALUES ($1, $2) RETURNING id', [recipe, cuisine]);
    const recipeId = recipeInsertResult.rows[0].id;

    // Insert the ingredients into the database
    const ingredientValues = ingredients.filter((ingredient) => ingredient !== '').map((ingredient) => [ingredient]);
    const ingredientInsertResult = await pool.query(
    `INSERT INTO ingredients (ingredient)
    SELECT * FROM unnest($1::text[]) AS ingredient
    WHERE NOT EXISTS 
    (SELECT 1 FROM ingredients WHERE ingredient = $2)
    RETURNING id, ingredient`, [ingredientValues, '']);
    const ingredientRows = ingredientInsertResult.rows;

    // Insert the tags into the database
    const tagValues = tags.filter((tag) => tag !== '').map((tag) => [tag]);
    const tagInsertResult = await pool.query(
    `INSERT INTO tags (tag) 
    SELECT * FROM unnest($1::text[]) AS tag 
    WHERE NOT EXISTS (SELECT 1 FROM tags WHERE tag = ANY($1::text[])) 
    RETURNING id, tag`, [tagValues]);
    const tagRows = tagInsertResult.rows;

    // Insert the recipe-ingredient relationships into the database
    const recipeIngredientValues = [];
    for (const ingredientRow of ingredientRows) {
      recipeIngredientValues.push([recipeId, ingredientRow.id]);
    }
    await pool.query('INSERT INTO recipes_ingredients (recipes_id, ingredients_id) VALUES ($1, $2)', recipeIngredientValues);

    // Insert the recipe-tag relationships into the database
    const recipeTagValues = [];
    for (const tagRow of tagRows) {
      recipeTagValues.push([recipeId, tagRow.id]);
    }
    await pool.query('INSERT INTO recipe_tags (recipes_id, tags_id) VALUES ($1, $2)', recipeTagValues);

    return res.status(201).send('Recipe created successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

module.exports = app;