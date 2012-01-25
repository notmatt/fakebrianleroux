// TODO: really need express here? Don't think so.
require.paths.unshift('./lib/Mu/lib')

var http = require('http')
,   fakeBrian = require('./fakebrian')
,   Mu = require('mu')

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
	console.log("initializing");
	fakeBrian.init(function() {
		console.log("done - starting server");
		indexView.context.foobar = function() { return fakeBrian.genTweet(); }
	});
	var server = http.createServer(function(req, res) {
		res.writeHead(200, {'Content-Type' : 'text/html'});
		display(indexView, function(output) { res.end(output) });
	})
	var port = parseInt(process.env["NODEPORT"]) || 4040;
	server.listen(port);
	console.log("Started server on port ", port);
}

init();
