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
//GTG
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
//GTG
app.get('/recipes/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if(!Number.isInteger(id)) {
    res.status(404).send("That is not a number silly")
  }
  console.log("recipe: ", id);

  pool.query(`SELECT r.recipe AS recipe_name, 
  array_agg(DISTINCT i.ingredient) AS ingredients, 
  array_agg(DISTINCT t.tag) AS tags
  FROM recipes r
  LEFT JOIN recipes_ingredients ri ON r.id = ri.recipes_id
  LEFT JOIN ingredients i ON ri.ingredients_id = i.id
  LEFT JOIN recipes_tags rt ON r.id = rt.recipes_id
  LEFT JOIN tags t ON rt.tags_id = t.id
  WHERE r.id = $1
  GROUP BY r.recipe;`, [id], (err, result) => {
    if (err) {
      return next(err);
    }

  const recipe = result.rows[0];

  console.log("Recipe ", id, "values", recipe)

  if (recipe) {
    console.log('Recipe retrieved')
    return res.send(recipe);
  } else {
    return res.status(404).send("We dont have that ID")
  }

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

    // Insert the recipe, cuisine, ingredients, and tags into the database
    await pool.query('INSERT INTO recipes (recipe, cuisine) VALUES ($1, $2)', [recipe, cuisine]);
    for (const ingredient of ingredients) {
        await pool.query('INSERT INTO ingredients (ingredient) VALUES ($1)', [ingredient]);
    }
    for (const tag of tags) {
      if (tag !== '') {
        await pool.query('INSERT INTO tags (tag) VALUES ($1) ON CONFLICT DO NOTHING', [tag]);
      }
    }

    return res.status(201).send('Recipe created successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// GTG
app.delete("/recipes/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    return res.status(400).send("No recipe found with that ID");
  } else {}
  pool.query('DELETE FROM recipes WHERE id = $1', [id], (err, data) => {
    if (err){
      return next(err);
    } else {
      const deletedRecipe = data.rows[0];
      console.log(deletedRecipe);
      if (deletedRecipe){
        // respond with deleted row
        res.send(deletedRecipe);
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.log('General next error:', err);
  res.sendStatus(404);
});


module.exports = app;