const dropTablesQuery = `
  DROP TABLE IF EXISTS recipes_tags, recipes_ingredients, tags, recipes, ingredients CASCADE;
`;

const createIngredientsTableQuery = `
  CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  )
`;

const createRecipesTableQuery = `
  CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL
  )
`;

const createTagsTableQuery = `
  CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag TEXT NOT NULL
  )
`;

const createRecipesIngredientsTableQuery = `
  CREATE TABLE recipes_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE
  )
`;

const createRecipesTagsTableQuery = `
  CREATE TABLE recipes_tags (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE
  )
`;

// Define a function to execute the drop tables query
const dropTables = (callback) => {
  pool.query(dropTablesQuery, (error, result) => {
    if (error) {
      console.error('Error dropping tables:', error);
    } else {
      console.log('Tables dropped successfully.');
    }
    callback(error, result);
  });
};

// Define a function to execute the create tables queries
const createTables = (callback) => {
  pool.query(createIngredientsTableQuery, (error, result) => {
    if (error) {
      console.error('Error creating ingredients table:', error);
    } else {
      console.log('Ingredients table created successfully.');
    }
  });

  pool.query(createRecipesTableQuery, (error, result) => {
    if (error) {
      console.error('Error creating recipes table:', error);
    } else {
      console.log('Recipes table created successfully.');
    }
  });

  pool.query(createTagsTableQuery, (error, result) => {
    if (error) {
      console.error('Error creating tags table:', error);
    } else {
      console.log('Tags table created successfully.');
    }
  });

  callback();
};

// Define a function to execute the create recipes-ingredients and recipes-tags tables queries
const createJoinTables = (callback) => {
  pool.query(createRecipesIngredientsTableQuery, (error, result) => {
    if (error) {
      console.error('Error creating recipes_ingredients table:', error);
    } else {
      console.log('Recipes_ingredients table created successfully.');
    }
  });

  pool.query(createRecipesTagsTableQuery, (error, result) => {
    if (error) {
      console.error('Error creating recipes_tags table:', error);
    } else {
      console.log('Recipes_tags table created successfully.');
    }
  });

  callback();
};

// Call the functions in sequence
dropTables((error, result) => {
  if (!error) {
    createTables(() => {
      createJoinTables(() => {
        console.log('Migration completed successfully!');
      });
    });
  }
});