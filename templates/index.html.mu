<html>
<head><title>Fake Brian Leroux</title>
<style>
body { 
	color: #0a0a0a;
	background-color: #f0f0f0; 
}
.content, .brian {
	background-color: #fff;
	margin-left: auto;
	margin-right: auto;
	width: 480px;
	margin-top: 50px;
	padding: 1em 1em;
	border: 3px solid black;
	border-radius: 6px;
	-moz-border-radius: 6px;
	-webkit-border-radius: 6px;
	font-family: Helvetica, sans-serif;
}
	
.brian {
	width: 720px;
	font-size: 20pt;
}
</style>	
</head>
<body>
	<div class="brian">
		{{^foobar}}
		<b>Not working.</b>
		{{/foobar}}
		{{foobar}}
	</div>
	<div class="content">
		<p>A very simple markov-chain text generator based on an index of <a href="http://twitter.com/brianleroux">@brianleroux</a>'s latest few thousand tweets.</p>
		
		<p><a href="http://github.com/notmatt/fakebrianleroux">github: notmatt/fakebrianleroux</a></p>
	</div>
</body>

</html>