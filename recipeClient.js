let $displayArea = $(".w3-container")

//GET EVERYTHING BUTTON
$(document).ready(function(){
    $("#showRecipe").click(function() {    
        $(".w3-container").empty() 
        console.log( " show click called." );
        getAllRecipes()
    });
})

//GET BY ID BUTTON
$(document).ready(function(){
    $("#showRecipeID").click(function() {    
        $(".w3-container").empty() 
        console.log( " show click called." );
        console.log($('#id-input').val())
        getRecipeById($('#id-input').val())
    });
})

//DELETE BY ID BUTTON
$(document).ready(function(){
    $("#deleteButton").click(function() {    
        $(".w3-container").empty() 
        console.log( " show click called." );
        console.log($('#deleteForm').val())
        deleteId($('#deleteForm').val())
    });
})

//POST BUTTON
$(document).ready(function(){
    $("#addRecipe").click(function() {    
        $(".w3-container").empty() 
        const recipeName = $('#recipe-input').val();
        const cuisine = $('#cuisine-input').val();
        const ingredientsUn = $('#ingredient-input').val(); // convert the comma-separated string to an array
        const tagsUn = $('#tag-input').val(); // convert the comma-separated string to an array

        const ingredients = ingredientsUn.split(',')
        const tags = tagsUn.split(',')

        data = {
            "recipe": recipeName,
            "cuisine": cuisine,
            "ingredients": ingredients,
            "tags": tags
        }
        addRecipe(data);
    });
})

//RETRIEVE DATA FROM SERVER
function getAllRecipes() {
    const localUrl = 'http://localhost:8000/everything';
    const remoteUrl = 'https://food-and-you.onrender.com/everything';

    $.get(localUrl, function(data) {
      // display the data on the page
      console.log(data);
      seperate(data)

    }).fail(function() {
      // try the remote URL if the local URL fails
      tryRemoteUrl();
    });
  
    function tryRemoteUrl() {
      $.get(remoteUrl, function(data) {
        // display the data on the page
        console.log(data);
        seperate(data)
      }).fail(function() {
        console.error('Local and remote unavailable');
      });
    }
  }

//PREPARING ALL DATA FOR APPENDING BY SEPERATING
function seperate(data) {
 
for (let i = 0; i < data.length; i++) {
    let { recipe_name, ingredients, tags, id } = data[i];
    pushRecipeInfo(recipe_name, ingredients, tags, id);
    }
}

//GET FOR RECIPE BY ID
function getRecipeById(id) {
    const localUrl = `http://localhost:8000/recipes/${id}`;
    const remoteUrl = `https://food-and-you.onrender.com/recipes/${id}`;
  
    $.get(localUrl, function(data) {
      // display the data on the page
      console.log('current data from ID', data);
      // call a separate function to handle the recipe data
      seperateId(data);
    }).fail(function() {
      // try the remote URL if the local URL fails
      tryRemoteUrl();
    });
  
    function tryRemoteUrl() {
      $.get(remoteUrl, function(data) {
        // display the data on the page
        console.log(data);
        // call a separate function to handle the recipe data
        seperateId(data);
      }).fail(function() {
        console.error('Local and remote unavailable');
      });
    }
}

//ID DATA GET TO BE SEPERATED
function seperateId(data) {
    let { recipe_name, ingredients, tags, cuisine, id } = data
    console.log(data)
    pushRecipeInfo(recipe_name, ingredients, tags, id, cuisine)
}

//DELETE BY ID FUNCTION

function deleteId(id) {
    $.ajax({
      url: `http://localhost:8000/recipes/${id}`,
      type: 'DELETE',
      success: function(result) {
        console.log(result);
        // Do something on success
      },
      error: function(xhr, status, error) {
        console.log(error);
        // Try the remote URL if the local URL fails
        tryRemoteUrl();
      }
    });
  
    function tryRemoteUrl() {
      $.ajax({
        url: `https://food-and-you.onrender.com/recipes/${id}`,
        type: 'DELETE',
        success: function(result) {
          console.log(result);
          // Do something on success
        },
        error: function(xhr, status, error) {
          console.log(error);
          // Do something on error
        }
      });
    }
  }

//APPEND DATA TO PAGE FUNCTION
function pushRecipeInfo(recipe_name, ingredients, tags, id, cuisine) {

    let $foodcard = $('<div></div>');
    
    let $heading = $('<h3></h3>');
    $heading.text(id + '. ' + recipe_name);
    $foodcard.append($heading)
    
    let $ingredients = $('<p></p>');
    $ingredients.text('Ingredients: ' + ingredients.join(', '));
    $foodcard.append($ingredients);
    
    let $tags = $('<p></p>');
    $tags.text('Tags: ' + tags.join(', '));
    $foodcard.append($tags);
  
    $(".w3-container").append($foodcard);
}



//POST FUNCTION
function addRecipe(data) {
    const localUrl = 'http://localhost:8000/recipes';
    const remoteUrl = 'https://food-and-you.onrender.com/recipes';
  
    $.ajax({
      url: localUrl,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(result) {
        console.log(result);
        // Do something on success
      },
      error: function(xhr, status, error) {
        console.log(error);
        // Try the remote URL if the local URL fails
        tryRemoteUrl();
      }
    });
  
    function tryRemoteUrl() {
      $.ajax({
        url: remoteUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
          console.log(result);
          // Do something on success
        },
        error: function(xhr, status, error) {
          console.log(error);
          console.error('Local and remote unavailable');
        }
      });
    }
  }

