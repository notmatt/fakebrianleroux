var http = require('http')
,   express = require('express')
,   fakeBrian = require('./fakebrian')


// wrap the Mu rendering. Seems like there should be a simpler way.
var display = function(view, callback) {
	Mu.render(view.template, view.context, {}, function(err, output) {
		if(err) { throw err }
		
		var buffer = '';
		output.on('data', function(chunk) { buffer += chunk })
			  .on('end', function() { callback(buffer) });
	});
}

// view for the index.
var indexView = {
	template: "templates/index.html",
	context: {
		foobar : function() { return "indexing!"}
	}
}

var init = function() {
	// initialize the index, when finished, kick off the server.
  var genTweet = null;
  
	console.log("initializing");
	
  fakeBrian.init(function() {
   console.log("done - starting server");
   genTweet = fakeBrian.genTweet();
  });
	
	var app = express.createServer();

  app.get('/', function(req, res){
    // display(indexView, function(output) { res.end(output) });
    res.render('index.ejs', {layout:false,foobar:genTweet});
  });
  	
	app.listen(process.env.PORT || 1337);
}

init();