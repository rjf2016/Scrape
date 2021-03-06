/*
	===============================
	|         RICK FAHEY          |
	|		   Scraper		      |		
	|		 Week 18 H.W		  |
	===============================
   
====================
	DEPENDENCIES
===================*/
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Note & Article Models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Scrape
var request = require("request");
var cheerio = require("cheerio");
// var Promise = require("bluebird");

// mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

// Configure mongoose, using mlab
mongoose.connect('mongodb://articlescrape:articlescrape@ds141108.mlab.com:41108/heroku_x8fh99r1');
var db = mongoose.connection;

// logging any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


/*============
 	ROUTES
==============*/

// Simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});

// A GET request to scrape nj.com/middlesex site.
app.get('/scrape', function(req, res) {
	// first grab the body of the html with request
  request('http://www.nj.com/middlesex', function(error, response, html) {
  	// then, load that into cheerio and save it to $ for a shorthand selector
  	if(response.statusCode != 200) {
     	 res.send("Issue loading page.  Response.statusCode = " + response.statusCode); 
    };

   var $ = cheerio.load(html);

    // grab every h2 nested inside 'fullheadline' tag
    	$('.h2.fullheadline').each(function(i, element) {
    			
    			
    		
    			// this will hold the result object
				var result = {};
				// saves the title/text as a property of result object
				result.title = $(this).children('a').text();
				// saves the href as a property of result obj
				result.link = $(this).children('a').attr('href');

				//Passing full result object we got back to 'entry'
				var entry = new Article (result);

				// now, save that entry to the db
				entry.save(function(err, doc) {
				  if (err) {
				    console.log(err);
				  } else {
				    console.log(doc);
				  }
				});


    });
  });
  // tell the browser that we finished scrape
  res.send("Scrape Complete");
});

// this will get the articles scraped from the mongoDB
app.get('/articles', function(req, res){
	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// otherwise send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res){
	// using the id passed in the id parameter, 
	// prepare a query that finds the matching one in our db
	Article.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		} 
		// otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});


app.post('/articles/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} else {
			// using the Article id passed in the id parameter of our url, 
			// prepare a query that finds the matching Article in our db
			// and update it to make it's lone note the one we just saved
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			// execute the above query
			.exec(function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} else {
					// or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});



var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on ' + port);




// listen on port 3000
//app.listen(3000, function() {
  //console.log('App running on port 3000!');
//});
