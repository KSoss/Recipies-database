const { Pool } = require('pg');
const pool = require('./dbConn');

// Function to insert ingredients into the database
async function insertIngredients() {
  const result = await pool.query('SELECT COUNT(*) FROM ingredients');
  const count = parseInt(result.rows[0].count);
  if (count === 0) {
    await pool.query(
      `INSERT INTO ingredients (name) VALUES 
      ('eggs'), 
      ('flour'), 
      ('milk'), 
      ('butter'), 
      ('baking powder'),
      ('white sugar'),
      ('brown sugar'),
      ('kosher salt'),
      ('olive oil'),
      ('onion'), 
      ('bell pepper'), 
      ('garlic'), 
      ('paprika'), 
      ('cumin'), 
      ('chili powder'), 
      ('tomatoes'), 
      ('pepper'),
      ('cilantro'), 
      ('parsley'), 
      ('ground beef'), 
      ('garlic powder'), 
      ('hamburger buns')`
    );
    console.log('Ingredients added!');
  } else {
    console.log('Ingredients already in the database!');
  }
}

// Function to insert recipes into the database
async function insertRecipes() {
  const result = await pool.query('SELECT COUNT(*) FROM recipes');
  const count = parseInt(result.rows[0].count);
  if (count === 0) {
    await pool.query(
      `INSERT INTO recipes (name, cuisine) VALUES
      ('Old Fashion Pancakes', 'American'),
      ('Shakshuka', 'Middle Eastern'),
      ('Basic Burger', 'American')`
    );
    console.log('Recipes added!');
  } else {
    console.log('Recipes already in the database!');
  }
}

// Function to insert tags into the database
async function insertTags() {
  const result = await pool.query('SELECT COUNT(*) FROM tags');
  const count = parseInt(result.rows[0].count);
  if (count === 0) {
    await pool.query(
      `INSERT INTO tags (tag) VALUES 
      ('Breakfast'), 
      ('Lunch'), 
      ('Dinner'), 
      ('Dessert'), 
      ('Snack'), 
      ('Spicy'), 
      ('Savory')`
    );
    console.log('Tags added!');
  } else {
    console.log('Tags already in the database!');
  }
}

// Function to insert data into the recipes_ingredients table
async function insertRecipesIngredients() {
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO recipes_ingredients (recipes_id, ingredients_id) VALUES 
        (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), 
        (2, 8), (2, 9), (2, 10), (2, 1), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19),
        (3, 16), (3, 8), (3, 18), (3, 23), (3, 24), (3, 25), (3, 26)`
    );
    console.log('Data inserted into recipes_ingredients!');
    client.release();
  } catch (err) {
    console.error('Error inserting data into recipes_ingredients:', err);
  }
}

// Function to insert data into the recipes_tags table
async function insertRecipesTags() {
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO recipes_tags (recipes_id, tags_id) VALUES 
        (1, 1), 
        (2, 2), 
        (3, 3), 
        (2, 7), 
        (3, 7)`
    );
    console.log('Data inserted into recipes_tags!');
    client.release();
  } catch (err) {
    console.error('Error inserting data into recipes_tags:', err);
  }
}

// Insert ingredients, recipes, and tags first
insertIngredients();
insertRecipes();
insertTags();

// After a 2-second wait, insert data into recipes_ingredients and recipes_tags tables
setTimeout(async () => {
  await insertRecipesIngredients();
  await insertRecipesTags();
  pool.end();
}, 2000);