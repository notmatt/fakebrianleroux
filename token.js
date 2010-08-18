// Represents a typical NLP 'token'; simple.

var Token = exports.Token = function(word) {
	this.rawWord = word;
}

Token.prototype = {

	// might be gilding the lily here, or maybe curried lilys.
	
	// interesting idea: add a property, wrap it in a lazy-evaluation function.
	// e.g.:
	// addproperty : function(name, generator) {
	// 	this.prototype[name] = function(word) {
	//    generator(word, function(result) { this[name] = function() { return result; } })
	//  }
	// So would that work? maybe combined with get(property)?

  // something like:
  // { foo : function() { return "bar"}, get : function(prop) { return this[prop]() } }	
}