## README ##

A preliminary markov-chain generator from an index built on [@brianleroux's](http://twitter.com/brianleroux) last few thousand tweets.

`node fakebrian.js` will dump you to a REPL where fb.genTweet() will show you what's up.

`node app.js` will launch a web app on :3000, though it had dependencies on Express and Mu that are not yet as tidy as they should be.

Features:

 - Occasionally funny.

Doesn't feature:

 - Persistance
 - Configurability (e.g., other users)
 - Posting to @fakebrianleroux
 - feedback/reinforcement (Brian would/wouldn't say that!)

Markov chains in a nutshell: given a particular state, in this case the previous N words, determine the next word.  This is done via simple frequency, e.g.:

<pre>
 key : ["a", "fluffy"],
 words : ["kitten", "cloud", "kitten", "kitten"]
 
 next word: "kitten" (75%)  "cloud" (25%)
</pre>
