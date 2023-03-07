const { Pool } = require('pg');
const pool = require('./dbConn');


// Check if there are any authors in the database
pool.query('SELECT COUNT(*) FROM ingredients', (err, result) => {
    if (err) {
      console.log('Error checking ingredients', err);
      return;
    }
    const count = parseInt(result.rows[0].count);
    if (count === 0) {
      // Insert the ingredients into the database
      pool.query(
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
        ('hamburger buns')`,
        (err, result) => {
          if (err) {
            console.log('Error inserting ingredients:', err);
          } else {
            console.log('Ingredients in!');
          }
        }
      );
    } else {
      console.log('Ingredients already in the database!');
    }
});

pool.query('SELECT COUNT(*) FROM recipes', (err, result) => {
    if (err) {
      console.log('Error checking recipes:', err);
      return;
    }
    const count = parseInt(result.rows[0].count);
    if (count === 0) {
      // Insert the recipes into the database
      pool.query(
        `INSERT INTO recipes (name, cuisine) VALUES
        ('Old Fashion Pancakes', 'American'),
        ('Shakshuka', 'Middle Eastern'),
        ('Basic Burger', 'American')`,
        (err, result) => {
          if (err) {
            console.log('Error inserting recipes:', err);
          } else {
            console.log('Recipes in!');
          }
        }
      );
    } else {
      console.log('Recipes already in the database!');
    }
});

pool.query('SELECT COUNT(*) FROM tags', (err, result) => {
    if (err) {
      console.log('Error checking tags', err);
      return;
    }
    const count = parseInt(result.rows[0].count);
    if (count === 0) {
      // Insert the tags into the database
      pool.query(
        `INSERT INTO tags (tag) VALUES 
        ('Breakfast'), 
        ('Lunch'), 
        ('Dinner'), 
        ('Dessert'), 
        ('Snack'), 
        ('Spicy'), 
        ('Savory')`,
        (err, result) => {
          if (err) {
            console.log('Error inserting tags:', err);
          } else {
            console.log('Tags added!');
          }
        }
      );
    } else {
      console.log('Tags already in the database!');
    }
});

pool.query(
  `INSERT INTO recipes_ingredients (recipes_id, ingredients_id) VALUES 
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), 
  (2, 8), (2, 9), (2, 10), (2, 1), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19),
  (3, 16), (3, 8), (3, 18), (3, 23), (3, 24), (3, 25), (3, 26)`,
  (err, result) => {
    if (err) {
      console.log('Error inserting data into recipes_ingredients:', err);
    } else {
      console.log('Data inserted into recipes_ingredients!');
    }
  }
);

pool.query(
  `INSERT INTO recipes_tags (recipes_id, tags_id) VALUES 
  (1, 1), 
  (2, 2), 
  (3, 3), 
  (2, 7), 
  (3, 7)`,
  (err, result) => {
    if (err) {
      console.log('Error inserting data into recipes_tags:', err);
    } else {
      console.log('Data inserted into recipes_tags!');
    }
  }
);