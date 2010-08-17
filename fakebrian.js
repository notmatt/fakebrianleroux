var markov = require('./markov')
,   indexer = require('./indexer')
,	twitter = require('./twitter')
,   tok = require('./toktag')
,	repl = require('repl')

var ready = false;

/**
 * Generate a tweet.
 */
exports.genTweet = function() {
	var tweet;
	markov.generate([tok.initialToken], complete, function(tokens) {
		tweet = renderTweet(tokens);
	});
	return tweet;
}

/**
 * Render tokens to a tweet-like string.
 */
var renderTweet = function(tokens) {
	if (tokens.length < 2) {
		return "";
	}
	var tweet = tokens.slice(1).reduce(function(tweet, token) {
		if (token == tok.finalToken) { return tweet + "." }
		return tweet + " " + token;
	}, "");
	return tweet.trim();
}


/**
 * Completeness function for tweets. 50-char minimum, then will accept <END>. Otherwise, 120-char and up.
 */
var complete = function(tokens) {
	var tweet = renderTweet(tokens);
	var mightBeOver = tokens[tokens.length-1] == tok.finalToken;
	
	if (mightBeOver) { return true }
	
	if (tweet.length > 120) { return true }
}

/**
 * Starts the indexing process, calls back when done.
 */
exports.init = function(callback) {
	console.log("Indexing.")
	indexer.fetchWholeIndex(twitter.fetchPage, function() { 
		console.log("indexed!");
		return callback();
	});
}

// dumps you to a REPL with fb defined when the indexing is finished.
// generate via fb.genTweet()
if (process.argv[1] == __filename) {
	console.log("Indexing.")
	indexer.fetchWholeIndex(twitter.fetchPage, function() { 
		repl.start("fb> ").context.fb = exports;
		console.log("indexed!");
	});
}
