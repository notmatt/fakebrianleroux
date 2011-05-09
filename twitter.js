var http = require('http');

// constructs the url to brian's tweets, optionally maxId, sinceId, count
var brianUrl = function(sinceId, count, page) {
	var brianUrl = "http://api.twitter.com/1/statuses/user_timeline.json?user_id=676363&trim_user=1";
	
	var extraParams = '';
	extraParams += sinceId ? "&since_id=" + sinceId : '';
	extraParams += count ? "&count=" + count : '';
	extraParams += page ? "&page=" + page : '';
	
	return brianUrl + extraParams;
}

/**
 * Grabs a page at a time of of brian's tweets.
 */
var fetchTweets = function(sinceId, count, page, callback) {
	var url = brianUrl(sinceId, count, page);
	var request = http.createClient(80, "api.twitter.com").request("GET", url, {"host":"api.twitter.com"});
	
	request.on('response', function(response) {
		var buffer = '';
		response.on('data', function(chunk) { buffer += chunk; })
		        .on('end', function() {
			switch (response.statusCode) {
				case 200:
					callback(JSON.parse(buffer));
					break;
				case 502:
					console.log("Twitter over capacity.")
					callback([]);
					break;
				case 400:
					console.log("Rate limited, probably.")
					console.log(buffer)
					callback([]);
					break;
				default:  // just pretend it didn't happen.
					console.log("unexpected status code: " + response.statusCode);
					callback([]);
			}
		});
	});
	request.end(); 
}

// mock data for dev/test. Provides 9 pages.
exports.fetchMockPage = function(page, callback) {
	var mockData = [{"contributors":null,"in_reply_to_screen_name":"srbaker","favorited":false,"in_reply_to_status_id":21108929571,"place":null,"source":"<a href=\"http://twicca.r246.jp/\" rel=\"nofollow\">twicca</a>","in_reply_to_user_id":14106454,"geo":null,"user":{"id":676363},"coordinates":null,"id":21109091508,"truncated":false,"text":"srbaker think of all those licensing fees. Basically any commercial success w/ java is now threatened.","created_at":"Sat Aug 14 00:46:45 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"mezzoblue","favorited":false,"in_reply_to_status_id":21107738986,"place":null,"source":"<a href=\"http://twicca.r246.jp/\" rel=\"nofollow\">twicca</a>","in_reply_to_user_id":774280,"geo":null,"user":{"id":676363},"coordinates":null,"id":21107893870,"truncated":false,"text":"@mezzoblue well played sir!","created_at":"Sat Aug 14 00:27:28 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"danebro","favorited":false,"in_reply_to_status_id":21105842309,"place":null,"source":"web","in_reply_to_user_id":1320651,"geo":null,"user":{"id":676363},"coordinates":null,"id":21106772726,"truncated":false,"text":"@danebro Good idea. Also same weight in gasoline. In case you need to start fire[s].","created_at":"Sat Aug 14 00:09:21 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"jennjenn","favorited":false,"in_reply_to_status_id":21098901224,"place":null,"source":"web","in_reply_to_user_id":757683,"geo":null,"user":{"id":676363},"coordinates":null,"id":21103323006,"truncated":false,"text":"@jennjenn why is appcelerator better? (we need to know if we're gonna fix it!)","created_at":"Fri Aug 13 23:13:31 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"danebro","favorited":false,"in_reply_to_status_id":21102532985,"place":null,"source":"web","in_reply_to_user_id":1320651,"geo":null,"user":{"id":676363},"coordinates":null,"id":21102818097,"truncated":false,"text":"@danebro according to science avg 70 kg male has blood volume of approx 5 liters. The weekend is 2 days. So you require 15 Palm Bays.","created_at":"Fri Aug 13 23:05:15 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"ThomTheriault","favorited":false,"in_reply_to_status_id":21099004682,"place":null,"source":"web","in_reply_to_user_id":1935201,"geo":null,"user":{"id":676363},"coordinates":null,"id":21102633814,"truncated":false,"text":"@ThomTheriault http://github.com/xui/xui","created_at":"Fri Aug 13 23:02:20 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"DavidKaneda","favorited":false,"in_reply_to_status_id":21097734083,"place":null,"source":"web","in_reply_to_user_id":11231232,"geo":null,"user":{"id":676363},"coordinates":null,"id":21098377316,"truncated":false,"text":"@DavidKaneda me too!!!","created_at":"Fri Aug 13 21:53:16 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"DavidKaneda","favorited":false,"in_reply_to_status_id":21097170925,"place":null,"source":"web","in_reply_to_user_id":11231232,"geo":null,"user":{"id":676363},"coordinates":null,"id":21097299630,"truncated":false,"text":"@DavidKaneda that was pretty smartass. In all honesty: I'll be happiest when its released and we can give PhoneGap a sensible default.","created_at":"Fri Aug 13 21:36:25 +0000 2010"},{"contributors":null,"in_reply_to_screen_name":"amyhoy","favorited":false,"in_reply_to_status_id":21096925059,"place":null,"source":"web","in_reply_to_user_id":627213,"geo":null,"user":{"id":676363},"coordinates":null,"id":21097034228,"truncated":false,"text":"@amyhoy ha! I accidentally discharged a can of bear mace in the house once and yahoo answers saved me. Gotta love the internets.","created_at":"Fri Aug 13 21:32:22 +0000 2010"}];
	var results = page > mockData.length ? [] : [mockData[page-1]];
	return callback(results);
}


// convenience. Page 1 = latest.
exports.fetchPage = function(page, callback) {
	console.log("Fetching page " + page)
	fetchTweets(false, 200, page, callback);
}


// TESTS

if (process.argv[1] == __filename) {

	console.log("Running tests...");

	var tests= [];

	tests.push({
		name : 'simple test',
		test : function() {
			return null;
		}
	});
	
	tests.push({
		name : 'url test',
		test : function() {
			var goodUrl = "http://api.twitter.com/1/statuses/user_timeline.json?user_id=676363&trim_user=1&since_id=21109091508&count=3";
			var testUrl = brianUrl("21109091508", 3);
			var error = null;
			if (goodUrl != testUrl) {
				error = "\n\tgoodUrl : " + goodUrl;
				error += "\n\ttestUrl : " + testUrl;
				throw error;
			};
		}
	})
	
	var repl = require("repl");

	// TODO: when this one throws, I can't get it to be caught. Can't figure out why not.
	tests.push({
		name : "Twitter API test",
		test : function() {
			var errors;
			fetchTweets("21009091507", 3, 1, function(data) {
				if (data.length != 2) {
					throw new Error("Data length incorrect, expect 2, get: " + data.length);
				}
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
