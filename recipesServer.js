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
    const recipeInsertResult = await pool.query('INSERT INTO recipes (recipe, cuisine) VALUES ($1, $2) RETURNING id', [recipe, cuisine]);
    const recipeId = recipeInsertResult.rows[0].id;
    
    // Insert the ingredients into the database and tie them to the recipe ID
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (ingredient !== '') {
      const ingredientInsertResult = await pool.query(
        'INSERT INTO ingredients (ingredient) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
        [ingredient]
      );
      let ingredientId;
      if (ingredientInsertResult.rows.length > 0) {
        ingredientId = ingredientInsertResult.rows[0].id;
      } else {
        const existingIngredientResult = await pool.query('SELECT id FROM ingredients WHERE ingredient = $1', [ingredient]);
        if (existingIngredientResult.rows.length > 0) {
          ingredientId = existingIngredientResult.rows[0].id;
        }
      }
      if (ingredientId) {
        await pool.query('INSERT INTO recipes_ingredients (recipes_id, ingredients_id) VALUES ($1, $2)', [recipeId, ingredientId]);
      }
    }
  }
   
  // Insert the tags into the database and create relationships with the recipe
  const tagIds = [];
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] !== '') {
      const tagInsertResult = await pool.query(
        'INSERT INTO tags (tag) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
        [tags[i]]
      );
      let tagId;
      if (tagInsertResult.rows.length > 0) {
        tagId = tagInsertResult.rows[0].id;
      } else {
        const existingTagResult = await pool.query('SELECT id FROM tags WHERE tag = $1', [tags[i]]);
        if (existingTagResult.rows.length > 0) {
          tagId = (existingTagResult.rows[0].id);
        }
      }

      // Create relationship between recipe and tag
      const recipeTagResult = await pool.query(
        'INSERT INTO recipes_tags (recipe_id, tag_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT * FROM recipe_tags WHERE recipe_id = $1 AND tag_id = $2)',
        [recipeId, tagId]
      );
      console.log('recipe-tag relationship inserted');
    }
  }

  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// I want to sleep

app.put('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { recipe, cuisine, ingredients, tags } = req.body;

    // Check if the recipe exists
    const recipeResult = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (recipeResult.rows.length === 0) {
      return res.status(404).send('Recipe not found');
    }

    // Update the recipe in the database
    const recipeUpdateResult = await pool.query('UPDATE recipes SET recipe = $1, cuisine = $2 WHERE id = $3', [recipe, cuisine, id]);
    console.log('recipe updated');

    // Delete old recipe-ingredient relationships
    await pool.query('DELETE FROM recipes_ingredients WHERE recipes_id = $1', [id]);

    // Insert new recipe-ingredient relationships
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      if (ingredient !== '') {
        const ingredientInsertResult = await pool.query(
          'INSERT INTO ingredients (ingredient) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
          [ingredient]
        );
        let ingredientId;
        if (ingredientInsertResult.rows.length > 0) {
          ingredientId = ingredientInsertResult.rows[0].id;
        } else {
          const existingIngredientResult = await pool.query('SELECT id FROM ingredients WHERE ingredient = $1', [ingredient]);
          if (existingIngredientResult.rows.length > 0) {
            ingredientId = existingIngredientResult.rows[0].id;
          }
        }
        if (ingredientId) {
          await pool.query('INSERT INTO recipes_ingredients (recipes_id, ingredients_id) VALUES ($1, $2)', [id, ingredientId]);
        }
      }
    }

    // Delete old recipe-tag relationships
    await pool.query('DELETE FROM recipe_tags WHERE recipes_id = $1', [id]);

    // Insert new recipe-tag relationships
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      if (tag !== '') {
        const tagInsertResult = await pool.query(
          'INSERT INTO tags (tag) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
          [tag]
        );
        let tagId;
        if (tagInsertResult.rows.length > 0) {
          tagId = tagInsertResult.rows[0].id;
        } else {
          const existingTagResult = await pool.query('SELECT id FROM tags WHERE tag = $1', [tag]);
          if (existingTagResult.rows.length > 0) {
            tagId = (existingTagResult.rows[0].id);
          }
        }
        if (tagId) {
          await pool.query('INSERT INTO recipe_tags (recipes_id, tags_id) VALUES ($1, $2)', [id, tagId]);
        }
      }
    }

    return res.status(200).send('Recipe updated successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});


app.delete("/recipes/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    return res.status(400).send("No recipe found with that ID");
  } else {}
  pool.query('DELETE FROM recipes WHERE id = $1', [id], (err, data) => {
    if (err){
      return next(err);
    } else {
        res.send('DELETED!');
    }
  });
});

app.use((err, req, res, next) => {
  console.log('General next error:', err);
  res.sendStatus(404);
});

module.exports = app;