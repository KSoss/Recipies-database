let $displayArea = $(".container")

// Show all Recipes button
$(document).ready(function(){
    $("#showRecipe").click(function() {    
        $displayArea.empty() 
        console.log( " show click called." );
        getAllRecipes()
    });
})


function getAllRecipes() {
    const pool = new Pool(dbConfig);
    pool.query('SELECT * FROM Recipes', (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const data = result.rows;
      for (let i = 0; i < data.length; i++) {
        const author = data[i].author;
        const title = data[i].name;
        const genre = data[i].genre;
        const ID = data[i].id;
        console.log(author, title, genre, ID);
        pushBookInfo(author, title, genre, ID);
      }
    });
  }

function getAllBooks() { $.get('http://localhost:8000/books', function(data) {
    // display the data on the page
    console.log(data)

    for (let i = 0; i < data.length; i++) {
        
        const author = data[i].author
        const title = data[i].name
        const genre = data[i].genre
        const ID = data[i].id
        console.log(author, title, genre, ID)
        pushBookInfo(author, title, genre, ID)
    }

    })
}
  
function pushBookInfo(author, title, genre, ID) {

    let $bookcard = $('<div></div>')
    $bookcard.text(ID + " " + title + " " + author + " " + genre)

    $displayArea.append($bookcard)
}

// Show all books button
$(document).ready(function(){
    $("#addBook").click(function() {    
        // $displayArea.empty() 
        console.log( " add click called." );
        let titleD = $('#title-input').val();
        let genreD = $('#genre-input').val();
        let authorD = $('#author-input').val();
        const bookData = 
        {
            'title': titleD, 
            'genre': genreD, 
            'author': authorD
        }

        if (titleD && genreD && authorD) {
            console.log(bookData)
            // alert('theworld')
            $.post('http://localhost:8000/books', bookData, function(data, status, jqXHR, json){
                alert("it worked holy fuck");
              });

          } else {
            alert('Please fill in all fields');
        }
    });
});

// function addNewBook(title, genre, author) {

//     $.post('http://localhost:8000/books',
//     {   'title': title, 
//         'genre': genre, 
//         'author': author 
//     },   function(data, status){
//         alert("Data: " + data + "\nStatus: " + status);
//       });
//     };

    
    // $.ajax({
    //     type: 'POST',
    //     url: 'http://localhost:8000/books',
    //     data: bookData,
    //     success: function(data) {
    //         console.log('New book added:', data);
    //         // Handle success, e.g. show a success message to the user
    //     },
    //     error: function(jqXHR, textStatus, errorThrown) {
    //         console.error('Error adding new book:', errorThrown);
    //         // Handle error, e.g. show an error message to the user
    //     }
    // });
// }
        


