var twitter = require('./twitter')
,   tok = require('./toktag')
,   fs = require('fs')
,   db2 = require('dirty')('./data/ngrams.db')

// simplest possible index structure; no persistence, no nothing.
var Index = function() {
  this.tweetCount = 0;
	this.ngrams = [];
};

var index = new Index();



/**
 * Resets, then pulls and indexes the entire tweet stream.
 */
exports.fetchWholeIndex = function(fetchPage, callback) {
  db2.on('load', function() {
    index = new Index();
    exports.fetchIndexSince(1, fetchPage, callback);
  });
}

/**
 * Pulls and indexes the stream since a given id.
 */ 
exports.fetchIndexSince = function(id, fetchPage, callback) {
	// pages of 200.
	// continue until:
	// - page < 200
	// - page is empty.
	var results;
	var page = 1;
	fetchPage(page, function maybeNextPage(results) {
		// TODO: implement exponential backoff for when twitter complains? or just a delay?
		if (results.length > 0 && page < 16) {
			
			updateTopATUsersList(results);
      saveNGrams(results);
			add(results);
			
			page += 1;
			fetchPage(page, maybeNextPage);
		} else {
			if (callback) { callback(index) }
		}
	});
}

/**
 * Gets the list of possible next words, given a set of current words (i.e., a key).
 */
exports.get = function(tokens) {
	var n = tokens.length; // size of key.
	var key = makeKeyFor(tokens);	
	if (index.ngrams[n][key]) {
		return index.ngrams[n][key];
	}
}

/**
 * Fallback position: gets a random word.  Uses the keys from the bigram list,
 * so doesn't account for frequency (but will have at least one non-random follow-up).
 */
exports.getRandomWord = function() {
	var words = [];
	for (key in index.ngrams[1]) {
		if (key != makeKeyFor([tok.initialToken]) || key != makeKeyFor([tok.finalToken])) {
			words.push(key);
		}
	}
	return words[Math.floor(Math.random() * words.length)].slice(1);
}

/**
 * Key strategy is just simple join of tokens with _ for simplicity.
 */
var makeKeyFor = function(tokens) {
	return "_" + tokens.join("_");
}

// wrap tokenising methods together.
var tokenize = function(tweet, callback) {
	tok.whitespaceTokenizer(tweet, function(tokens) {
		tok.normalize(tokens, false, function(normTokens) {
			callback(normTokens);
		})
	})
}

/**
 * Adds ngrams to the index in this schema:
 * index.ngrams[key_length][key][[values]]
 * We dont actually count or normalize the word lists, just pick from the bag directly.
 */
var addNgrams = function(ngrams) {
	if (ngrams.length == 0) {
		return;
	} else {
		var n = ngrams[0].length - 1; // key length, not ngram length 
		if (!index.ngrams[n]) { index.ngrams[n] = {} }
		
		ngrams.map(function(ngram) {
			var value = ngram.pop();               // ["once", "upon", "a"] : ["time"]
			var key = makeKeyFor(ngram);           // "once_upon_a" : ["time"]
			if (index.ngrams[n][key]) {
				index.ngrams[n][key].push(value);  // "once_upon_a" : ["time", "place", "time", "etc"]
			} else {
				index.ngrams[n][key] = [value];
			}
		});
	}
}

// tokenizes then ngrams, then adds to the index.
var add = function(tweets) {
	// don't worry about the actual tweets for now.
	// index.tweets = index.tweets.concat(tweets);

	index.tweetCount += tweets.length;
	
	tweets.map(function(tweet) {
		tokenize(tweet.text, function(tokens) {
			for (n=2; n <= 4; n++) {
				tok.ngramify(tokens, n, function(ngrams) { 
				  addNgrams(ngrams);
				})
			}
		});
	});
}


// top_at.txt is a JSON file with all the users brian mentions at the beginning of the message
// This call is SYNC!
var updateTopATUsersList = function(tweets) {
  var data = fs.readFileSync("./data/top_at.txt","utf8");
  var topAts = JSON.parse(data);
    
  tweets.map(function(tweet) {
    if (tweet.text.split(" ")[0].substr(0,1) == "@") {
      var user = tweet.text.split(" ")[0];
      if (topAts[user] == undefined) topAts[user] = 0;
      topAts[user] += 1;
    }
  });
                    
  fs.writeFileSync("./data/top_at.txt",JSON.stringify(topAts),"utf8");
}

// Saves out the ngrams / frequency to file
var saveNGrams = function(tweets) {

	tweets.map(function(tweet) {
		tokenize(tweet.text, function(tokens) {
		  var t = [];
      tokens.map(function(toke){
        if (toke !== "<BEGIN>" && toke !== "<END>")
          t.push(toke);
		  })
		  
		  // BiGrams
      tok.ngramify(t, 2, function(ngrams) {
        ngrams.forEach(function(gram){
          var currentKey = gram.join(' ');
          var value = db2.get(currentKey);
          if (value === undefined) {
            db2.set(currentKey, 1); 
          } else {
            db2.set(currentKey, (value += 1));      
          }          
        });       
      });
		
		  // TriGrams
      tok.ngramify(t, 3, function(ngrams) {
        ngrams.forEach(function(gram) {
          var currentKey = gram.join(' ');
          var value = db2.get(currentKey);
          if (value === undefined) {
            db2.set(currentKey, 1); 
          } else {
            db2.set(currentKey, (value += 1));      
          }          
        });       
      });
      
		});   
	});   
}


// TEST(S)
if (process.argv[1] == __filename) { 
	
	var repl = require('repl');
	console.log("Running tests...");
	
	var tests = [];
	
	tests.push({
		name : "Full index test",
		test : function() {
			var pageCount = 0;
			var tweets;
			
			exports.fetchWholeIndex(twitter.fetchMockPage, function() {
        if (index.tweetCount != 9) {
         throw new Error("Expected 9 tweets, found: " + index.tweetCount);
        }
			});
			// to inspect index.
      repl.start("indexed - node> ").context.index = index;
		}
	});
	
  // tests.push({
  //  name : "get test",
  //  test : function() {
  //    var expected = ["give", "of"];
  //    var actual = exports.get(["can"]);
  //    if (expected[0] != actual[0] || expected[1] != actual[1]) {
  //      throw "Expected ['give', 'of'], but got: ['" + actual[0] + "', '" + actual[1] + "']"
  //    }
  //  }   
  // })
	
	// execute tests.
	tests.map(function(test, i, arr) {
		var errors;
		try {
			test.test();
		} catch(err) {
			errors = err;
		} finally {
			console.log(test.name + (!errors ? " passed." : " FAILED!!!! >>> " + errors));
		}
	});
}


