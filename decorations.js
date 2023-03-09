$(document).ready(function() {
    // when the advanced button is clicked
    $("#advanced-toggle").click(function() {
      // toggle the visibility of the forms
      $("#delete-recipe-form").toggle();
      $("#add-recipe-form").toggle();
      $("#update-recipe-form").toggle();
    });
  });