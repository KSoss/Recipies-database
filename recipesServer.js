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

// GET EVERY RECIPE USING JOIN
app.get('/everything', (req, res, next) => {

  pool.query(`SELECT r.id, r.recipe AS recipe_name, r.cuisine,
  array_agg(DISTINCT i.ingredient) AS ingredients, 
  array_agg(DISTINCT t.tag) AS tags
  FROM recipes r
  LEFT JOIN recipes_ingredients ri ON r.id = ri.recipes_id
  LEFT JOIN ingredients i ON ri.ingredients_id = i.id
  LEFT JOIN recipes_tags rt ON r.id = rt.recipes_id
  LEFT JOIN tags t ON rt.tags_id = t.id
  GROUP BY r.id, r.recipe, r.cuisine;`, (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  })
})

// GET RECIPE BY ID USING JOIN
app.get('/recipes/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if(!Number.isInteger(id)) {
    res.status(404).send("That is not a number silly")
  }
  console.log("recipe: ", id);

  pool.query(`SELECT r.id, r.recipe AS recipe_name, r.cuisine,
  array_agg(DISTINCT i.ingredient) AS ingredients, 
  array_agg(DISTINCT t.tag) AS tags
  FROM recipes r
  LEFT JOIN recipes_ingredients ri ON r.id = ri.recipes_id
  LEFT JOIN ingredients i ON ri.ingredients_id = i.id
  LEFT JOIN recipes_tags rt ON r.id = rt.recipes_id
  LEFT JOIN tags t ON rt.tags_id = t.id
  WHERE r.id = $1
  GROUP BY r.id, r.recipe, r.cuisine;`, [id], (err, result) => {
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
// POST/ADDING NEW RECIPE
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
        'INSERT INTO recipes_tags (recipes_id, tags_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT * FROM recipes_tags WHERE recipes_id = $1 AND tags_id = $2)',
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

// Why are we here... just to suffer
// PATCH/UPDATE A RECIPE
app.patch('/recipes/:id', async (req, res) => {
  try {

    //VARIABLE CREATION
    const { id } = req.params;
    const { recipe, cuisine, ingredients, tags} = req.body;
    
    //CHECK IF RECPIE EXISTS, ERROR IF IT EXISTS
    const recipeResult = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (recipeResult.rows.length === 0) {
      return res.status(404).send('This ID does not exist');
    }

    //RECIPE CHECK AND UPDATE
    if (!recipe) {
      console.log('no need to update recipe')
    } else {
    // Update the recipe name in the database
    const recipeUpdateResult = await pool.query(`UPDATE recipes SET recipe = $1 WHERE id = $2`, [recipe, id]);
    }

    //CUISINE CHECK AND UPDATE
    if(!cuisine) {
      console.log('no need to update cuisine')
    } else {
      const cuisineUpdateResult = await pool.query(`UPDATE recipes SET cuisine = $1 WHERE id = $2`, [cuisine, id]);
    }
    
    // TAGS CHECK AND UPDATE
    if(tags.length < 1) {
      console.log('no need to update tags')
    } else {
      // First delete the existing relationships between tags and recipes
      await pool.query('DELETE FROM recipes_tags WHERE recipes_id = $1', [id]);
      // Loop over tags array
      for (let i = 0; i < tags.length; i++) {
        // Get existing tag or create new tag if not made
        const tag = tags[i];
        let tagId;
        const existingTagResult = await pool.query('SELECT id FROM tags WHERE tag = $1', [tag]);
        if (existingTagResult.rows.length > 0) {
          tagId = existingTagResult.rows[0].id;
        } else {
          const newTagResult = await pool.query('INSERT INTO tags (tag) VALUES ($1) RETURNING id', [tag]);
          tagId = newTagResult.rows[0].id;
        }
        await pool.query('INSERT INTO recipes_tags (recipes_id, tags_id) VALUES ($1, $2)', [id, tagId]);
        console.log('recipe-tag relationship inserted');
      }
    }
  
  // INGREDIENTS CHECK UPDATE
  if (ingredients.length < 1) {
    console.log('no need to update ingredients')
  } else {
    // First delete the existing ingredients for this recipe
    await pool.query('DELETE FROM recipes_ingredients WHERE recipes_id = $1', [id]);
    // Then insert the updated ingredients for this recipe
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      if (ingredient !== '') {
        // Check if ingredient already exists in ingredients table
        const existingIngredientResult = await pool.query('SELECT id FROM ingredients WHERE ingredient = $1', [ingredient]);
        let ingredientId;
        if (existingIngredientResult.rows.length > 0) {
          ingredientId = existingIngredientResult.rows[0].id;
        } else {
          // Insert new ingredient into ingredients table
          const ingredientInsertResult = await pool.query(
            'INSERT INTO ingredients (ingredient) VALUES ($1) RETURNING id',
            [ingredient]
          );
          ingredientId = ingredientInsertResult.rows[0].id;
        }
        // Insert relationship between recipe and ingredient
        await pool.query('INSERT INTO recipes_ingredients (recipes_id, ingredients_id) VALUES ($1, $2)', [id, ingredientId]);
      }
    }
    // Log any new ingredients that were inserted
  }

    res.send(`Recipe updated!`)

  
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// DELETE A RECIPE
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

// internal to check recipes
app.get('/recipes', (req, res, next) => {
  pool.query('SELECT * FROM recipes', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

// internal table to check on ingredients
app.get('/ingredients', (req, res, next) => {
  pool.query('SELECT * FROM ingredients', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

// internal table to check on tags table
app.get('/tags', (req, res, next) => {
  pool.query('SELECT * FROM tags', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

// internal table to check on recipes_ingredients table
app.get('/RI', (req, res, next) => {
  pool.query('SELECT * FROM recipes_ingredients', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

// internal table to check on recipes_tags table
app.get('/RT', (req, res, next) => {
  pool.query('SELECT * FROM recipes_tags', (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result.rows);
  });
});

app.use((err, req, res, next) => {
  console.log('General next error:', err);
  res.sendStatus(404);
});

module.exports = app;