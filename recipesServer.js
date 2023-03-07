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
  pool.query(`SELECT r.name AS recipe_name, array_agg(i.name) AS ingredients, array_agg(t.name) AS tags
  FROM recipes r
  LEFT JOIN recipes_ingredients ri ON r.id = ri.recipe_id
  LEFT JOIN ingredients i ON ri.ingredients_id = i.id
  LEFT JOIN recipes_tags rt ON r.id = rt.recipe_id
  LEFT JOIN tags t ON rt.tags_id = t.id
  GROUP BY r.name;`, (err, result) => {
  })
})

//Lord forgive me for what I must do

app.post('/recipes', async (req, res) => {
  try {
    const { recipe, cuisine, ingredients, tags } = req.body;

    // Check if the recipe already exists
    const recipeResult = await pool.query('SELECT * FROM recipes WHERE name = $1', [recipe]);
    if (recipeResult.rows.length > 0) {
      return res.status(400).send('Recipe already exists');
    }

    // Insert the recipe into the database
    const recipeInsertResult = await pool.query('INSERT INTO recipes (recipe, cuisine) VALUES ($1, $2) RETURNING id', [recipe, cuisine]);
    const recipeId = recipeInsertResult.rows[0].id;

    // Insert the ingredients into the database
    const ingredientValues = ingredients.filter((ingredient) => ingredient !== '').map((ingredient) => [ingredient]);
    const ingredientInsertResult = await pool.query('INSERT INTO ingredients (ingredient) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id, name', ingredientValues);
    const ingredientRows = ingredientInsertResult.rows;

    // Insert the tags into the database
    const tagValues = tags.filter((tag) => tag !== '').map((tag) => [tag]);
    const tagInsertResult = await pool.query('INSERT INTO tags (tag) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id, name', tagValues);
    const tagRows = tagInsertResult.rows;

    // Insert the recipe-ingredient relationships into the database
    const recipeIngredientValues = [];
    for (const ingredientRow of ingredientRows) {
      recipeIngredientValues.push([recipeId, ingredientRow.id]);
    }
    await pool.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES ($1, $2)', recipeIngredientValues);

    // Insert the recipe-tag relationships into the database
    const recipeTagValues = [];
    for (const tagRow of tagRows) {
      recipeTagValues.push([recipeId, tagRow.id]);
    }
    await pool.query('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2)', recipeTagValues);

    return res.status(201).send('Recipe created successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

module.exports = app;