// simple markov chain.

var index = require('./indexer');

/**
 * Generates a markov chain, takes a choice() function to select the next word,
 * and a complete() function to determine when to stop.  Calls back with the token 
 * list generated.
 */
exports.generate = function(tokens, complete, callback) {
	// TODO: make the choice method configurable.
	var word = getNextWord(tokens, randomChoice);
	tokens.push(word);
	
	if (complete(tokens)) {
		callback(tokens);
	} else {
		exports.generate(tokens, complete, callback);
	}
}

/**
 * Gets the next word from the index, using the provided choice function.
 */
var getNextWord = function(tokens, choice) {
	var key = tokens.slice(-3);
	var choiceList = [];
	var words;
	switch(key.length) {
		case 3: 
			words = index.get(key);
			if (words) { choiceList.unshift(words) }
			key.shift();
		case 2:
			words = index.get(key);
			if (words) { choiceList.unshift(words) }
			key.shift();
		case 1:
			words = index.get(key);
			if (words) { choiceList.unshift(words) }
			break;
		default:
			// can't happen.
			throw new Error("Somehow don't have a key.");
	}
	return choice(choiceList);	
}

/**
 * Simple random choice from a list of words. Out list is a bag, reflecting actual frequency.
 */
var randomChoice = function(choiceList) {
	if (choiceList.length < 1) {
		return justStopTrying();
	}
	// adjustment to use same interface as simpleHeuristicChoice, collapse the list.
	var words = choiceList.reduce(function (acc, x) { if (x.length > 0) return acc.concat(x); return acc; }, []);
	var i = Math.floor(Math.random() * words.length);
	var word = words[i];
	return word;
}

/**
 * Fallback choice to a random word from the index.
 */
var fallbackChoice = function() { return index.getRandomWord(); }

/**
 * Fallback to just stopping the tweet; insert an '<END>'
 */
var justStopTrying = function() { return '<END>' }

/**
 * Mild heuristic, prefers the largest (n-gram) key with more than one option.  Tries to strike
 * a balance between nonsense and simply repeating tweets.
 * 
 * Expects an array of arrays, where high indices imply higher-n keys 
 * e.g., array[n] => ["a", "sheep", "floored"]
 */
var simpleHeuristicChoice = function(choiceList) {
	var bestChoice = choiceList.reduce(function(best, next) {
		// >= to favour higher-order lists in a tie.
		return (next.length >= best.length ? next : best);
	}, []);
	// now random from this list.
	return randomChoice([bestChoice]);
}


// TESTS
if (process.argv[1] == __filename) { 
	
	var repl = require('repl');
	var tests = [];
	console.log("Running tests...");
	
	var repl = require('repl');
	
	// need a mock index.
	var twitter = require('./twitter');
	index.fetchWholeIndex(twitter.fetchMockPage, function() {});
	
	// simple completion function, stops at 10 tokens.
	var simpleCompletion = function(tokens) {
		return tokens.length >= 10;
	}

	// getNextWords test.
	
	tests.push({
		name : "get next word",
		test : function() {
			// internets: [ '<END>' ]
			var expected = '<END>';
			var actual = getNextWord(['internets'], randomChoice);
			if (actual != expected) {
				return "\n\tExpected <END>, got " + actual;
			}
		}
	});
	

	tests.push({
		name : "Generate test",
		test : function() {
			var seed = ['<BEGIN>'];
			exports.generate(seed, randomChoice, simpleCompletion, function(res) {
				// repl.start("generate> ").context.result = res;
				console.log("Generated: " + res.join(" "));
				if (res.length != 10) {
					throw "Generated too many tokens!";
				}
			});
		}
	});
		
	// this seed value in the standard data creates a short tweet that doesn't
	// pass the completeness test used here.  Should fall back to a random word.
	tests.push({
		name : "Garden path test.",
		test : function() {
			var seed = ['<BEGIN>', '@mezzoblue'];
			exports.generate(seed, randomChoice, simpleCompletion, function(res) {
				console.log("Generated: " + res.join(" "));
				if (res.length != 10) {
					throw "Generated too many tokens!";
				}
			});
		}
	});

	// execute tests.
	tests.map(function(test, i, arr) { 
		var errors;
		try {
			test.test();
		} catch(err) {
			errors = err;
		} finally {
			console.log(test.name + (!errors ? " passed." : " FAILED!!!1! >>> " + errors));
		}
	});
}