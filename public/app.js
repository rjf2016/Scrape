// grab the articles as a json
$.getJSON('/articles', function(data) {

  for (var i = 0; i<data.length; i++){

      var str = "<a href='#' class='list-group-item' data-id='" + data[i]._id + "'>";
      str +=  "<h4 class='list-group-item-heading' data-id='" + data[i]._id + "'>" + data[i].title + "</h4>";
      str +=  "<p class='list-group-item-text' data-id='" + data[i]._id + "'>" + data[i].link + "</p></a>";
      $('#listOfArticles').append(str);
      
  }
});

// whenever someone clicks an <a> tag
$(document).on('click', 'a', function(){
  // empty the note section
  $('#notes').empty();
  // save the id from the <a> tag
  var thisId = $(this).attr('data-id');

  // ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // then, add the note information to the page
    .done(function( data ) {
      console.log(data);
      // the title of the article
      $('#notes').append('<h5>' + data.title + '</h5>'); 
      // an input to enter a new title
      // a textarea to add a new note body
      $('#notes').append('<textarea id="bodyinput" name="body" rows="10"></textarea>'); 
      // a button to submit a new note, with the id of the article saved to it
      $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

      // if there's a note in the article
      if(data.note){
        // place the title of the note in the title input
        $('#titleinput').val(data.note.title);
        // place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
      }
    });
});

// when you click the savenote button
$(document).on('click', '#savenote', function(){
  // grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');

  // run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $('#titleinput').val(), // value taken from title input
      body: $('#bodyinput').val() // value taken from note textarea
    }
  })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // empty the notes section
      $('#notes').empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $('#titleinput').val("");
  $('#bodyinput').val("");
});
