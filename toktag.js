var initialToken = exports.initialToken = "<BEGIN>";
var finalToken = exports.finalToken = "<END>";

/**
 * Very simple tokeniser on whitespace. Adds special <BEGIN> and <END> tags.
 */
exports.whitespaceTokenizer = function(text, callback) {
	var tokens = text.split(/\s* \s*/);
	tokens.unshift(initialToken);
	tokens.push(finalToken);
	
	callback(tokens);
}

/**
 * Processes tokens, getting rid of commas, periods, and the like.
 */
exports.punctuationProcessor = function(tokens, keep, callback) {
	callback(tokens.reduce(function(acc, x, i, arr) {
		// [.,;:!?()] - only worried about final spots.
		if (x.match(/[.,;'"!?]$/)) {
			acc.push(x.substring(0, x.length-1));
			if (keep) { acc.push(x.substring(x.length-1)); }
		} else {
			acc.push(x);
		}
		return acc;
	}, []));
}

// TODO:
// - taggers.
//   - users
//   - hashtags
//   - POS

/**
 * Generates all adjacent n-grams for an ordered set of tokens, e.g.,
 * ["a", "b", "c", "d"] => [["a", "b"], ["b", "c"], ["c", "d"]]
 */
exports.ngramify = function(tokens, n, callback) {	
	if (tokens.length == n)	{ // barely enough
		callback([tokens]);
	} else if (tokens.length < n) { // not enough
		callback([]);
	} else {
		callback(tokens.reduce(function(acc, x, i, arr) {
			if (i + n > arr.length) { return acc; }
			var ngram = arr.slice(i, i+n);
			acc.push(ngram);
			return acc;
		}, []));
	}
}

// TESTS
if (process.argv[1] == __filename) { 

	// mock data from:
	// http://api.twitter.com/1/statuses/user_timeline.json?user_id=676363&trim_user=1&max_id=21109091508&count=10
	// 10 recent tweets, a couple of replys, a few not.
	var mockData = [{"contributors":null,"in_reply_to_screen_name":"srbaker","favorited":false,"in_reply_to_status_id":21108929571,"place":null,"source":"<a href=\"http://twicca.r246.jp/\" rel=\"nofollow\">twicca</a>","in_reply_to_user_id":14106454,"geo":null,"user":{"id":676363},"coordinates":null,"id":21109091508,"truncated":false,"text":"@srbaker think of all those licensing fees. Basically any commercial success w/ java is now threatened.","created_at":"Sat Aug 14 00:46:45 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"mezzoblue","favorited":false,"in_reply_to_status_id":21107738986,"place":null,"source":"<a href=\"http://twicca.r246.jp/\" rel=\"nofollow\">twicca</a>","in_reply_to_user_id":774280,"geo":null,"user":{"id":676363},"coordinates":null,"id":21107893870,"truncated":false,"text":"@mezzoblue well played sir!","created_at":"Sat Aug 14 00:27:28 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"danebro","favorited":false,"in_reply_to_status_id":21105842309,"place":null,"source":"web","in_reply_to_user_id":1320651,"geo":null,"user":{"id":676363},"coordinates":null,"id":21106772726,"truncated":false,"text":"@danebro Good idea. Also same weight in gasoline. In case you need to start fire[s].","created_at":"Sat Aug 14 00:09:21 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"jennjenn","favorited":false,"in_reply_to_status_id":21098901224,"place":null,"source":"web","in_reply_to_user_id":757683,"geo":null,"user":{"id":676363},"coordinates":null,"id":21103323006,"truncated":false,"text":"@jennjenn why is appcelerator better? (we need to know if we're gonna fix it!)","created_at":"Fri Aug 13 23:13:31 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"danebro","favorited":false,"in_reply_to_status_id":21102532985,"place":null,"source":"web","in_reply_to_user_id":1320651,"geo":null,"user":{"id":676363},"coordinates":null,"id":21102818097,"truncated":false,"text":"@danebro according to science avg 70 kg male has blood volume of approx 5 liters. The weekend is 2 days. So you require 15 Palm Bays.","created_at":"Fri Aug 13 23:05:15 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"ThomTheriault","favorited":false,"in_reply_to_status_id":21099004682,"place":null,"source":"web","in_reply_to_user_id":1935201,"geo":null,"user":{"id":676363},"coordinates":null,"id":21102633814,"truncated":false,"text":"@ThomTheriault http://github.com/xui/xui","created_at":"Fri Aug 13 23:02:20 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"DavidKaneda","favorited":false,"in_reply_to_status_id":21097734083,"place":null,"source":"web","in_reply_to_user_id":11231232,"geo":null,"user":{"id":676363},"coordinates":null,"id":21098377316,"truncated":false,"text":"@DavidKaneda me too!!!","created_at":"Fri Aug 13 21:53:16 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"DavidKaneda","favorited":false,"in_reply_to_status_id":21097170925,"place":null,"source":"web","in_reply_to_user_id":11231232,"geo":null,"user":{"id":676363},"coordinates":null,"id":21097299630,"truncated":false,"text":"@DavidKaneda that was pretty smartass. In all honesty: I'll be happiest when its released and we can give PhoneGap a sensible default.","created_at":"Fri Aug 13 21:36:25 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"amyhoy","favorited":false,"in_reply_to_status_id":21096925059,"place":null,"source":"web","in_reply_to_user_id":627213,"geo":null,"user":{"id":676363},"coordinates":null,"id":21097034228,"truncated":false,"text":"@amyhoy ha! I accidentally discharged a can of bear mace in the house once and yahoo answers saved me. Gotta love the internets.","created_at":"Fri Aug 13 21:32:22 +0000 2010"}];

	console.log("Running tests...");

	var tests= [];

	var compareTokens = function(arr1, arr2) {
		
		// length
		if (arr2.length != arr1.length) {
			console.log("Wrong number!");
			return "\n\t Expected " + arr1.length + " tokens, received " + arr2.length;
		}
		
		// contents
		mismatches = arr1.map(function(x, i, arr) {
			if (x != arr2[i]) {
				console.log("bad content! : " + x + " vs " + arr2[i]);
				return "\n\t Expected token: " + x +
					   "\n\t Received token: " + arr2[i]
			}
		}).filter(function(x, i, arr) {
			return (x != undefined);
		});
		
		if (mismatches.length > 0) { 
			return mismatches;
		}
	}
		
	// whitespace tokenizing test.
	tests.push({
		name : "Whitespace tokenizing test",
		test : function() {
			var text = mockData[0].text;
			var goodTokens = [ '<BEGIN>', '@srbaker', 'think', 'of', 'all', 'those', 'licensing', 'fees.', 'Basically', 'any', 'commercial', 'success', 'w/', 'java', 'is', 'now', 'threatened.', '<END>'];
			var testTokens = [];
			
			exports.whitespaceTokenizer(text, function(results) { 
				testTokens = results; 
				var err = compareTokens(goodTokens, testTokens);
				if (err) throw err;
			});
		}
	})
	
	// punctuation processor test; discard.
	tests.push({
		name : "Punctuation processing test (discard)",
		test : function() {
			var tokens = [ '@srbaker', 'think', 'of', 'all', 'those', 'licensing', 'fees.', 'Basically', 'any', 'commercial', 'success', 'w/', 'java', 'is', 'now', 'threatened.'];
			var goodTokens = [ '@srbaker', 'think', 'of', 'all', 'those', 'licensing', 'fees', 'Basically', 'any', 'commercial', 'success', 'w/', 'java', 'is', 'now', 'threatened'];
			var testTokens = [];
			
			exports.punctuationProcessor(tokens, false, function(results) {	
				testTokens = results; 
				var err = compareTokens(goodTokens, testTokens);
				if (err) throw err;
			});
		}
	});
	
	// punctuation processor test; keep.
	tests.push({
		name : "Punctuation processing test (keep)",
		test : function() {
			var tokens = [ '@srbaker', 'think', 'of', 'all', 'those', 'licensing', 'fees.', 'Basically', 'any', 'commercial', 'success', 'w/', 'java', 'is', 'now', 'threatened.'];
			var goodTokens = [ '@srbaker', 'think', 'of', 'all', 'those', 'licensing', 'fees', '.', 'Basically', 'any', 'commercial', 'success', 'w/', 'java', 'is', 'now', 'threatened', '.'];
			var testTokens = [];
			
			exports.punctuationProcessor(tokens, true, function(results) { 
				testTokens = results; 
				var err = compareTokens(goodTokens, testTokens);
				if (err) throw err;
			});
		}
	});
	
	// ngramify - exactly N tokens **including** start/end
	tests.push({
		name : "n-gram construction with exactly n(4) tokens",
		test : function() {
			var tokens = [ '<BEGIN>', '@srbaker', 'think', '<END>'];
			var goodTokens = [ '<BEGIN>', '@srbaker', 'think', '<END>'];
			var testTokens = [];
			
			exports.ngramify(tokens, 4, function(results) {	
				testTokens = results; 
				var err = compareTokens(goodTokens, testTokens[0]);
				if (err) throw err;
			});
		}
	});
	
	// ngramify - not enough tokens.
	tests.push({
		name : "too few tokens for n-gram",
		test : function() {
			var tokens = ['think'];
			var goodTokens = [];
			var testTokens;
			
			exports.ngramify(tokens, 4, function(results) {	
				testTokens = results; 
				var err = compareTokens(goodTokens, testTokens);
				if (err) throw err;
			});
		}
	})
	
	// ngramify - correct tokenization.
	tests.push({
		name : "n-gram test",
		test : function() {
			var tokens = [ '<BEGIN>', '@srbaker', 'think', 'of', 'all', 'those', 'licensing', '<END>']
			var goodTokens = [['<BEGIN>', '@srbaker', 'think'],
							  ['@srbaker', 'think', 'of'],
							  ['think', 'of', 'all'],
							  ['of', 'all', '<END>']];
			var testTokens = [];
			
			exports.ngramify(tokens, 3, function(results) { 
				testTokens = results;
				var err = compareTokens(goodTokens[1], testTokens[1]);
				if (err) throw err;
			});
		}
	})

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