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

// test

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`


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
        


