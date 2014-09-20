var mongo = require('./js/output/mongodb.js');

require('./js/feeds/twitter.js');
require('./js/feeds/guardian.js');

require('./js/analysis/sentiment.js');
require('./js/analysis/datatxt-nex.js');
require('./js/analysis/datatxt-cl.js');
require('./js/analysis/alerter.js');

//basic webserver
var express = require('express');
var app = express();

app.get('/', function(req, res)
{
    res.send('Hello World');
});

var server = app.listen(3000, function()
{
    console.log('Server listening on port %d', server.address().port);
});

/**
 * Input should normalise to the following format:
 *
 * text
 * url
 * related content
 */
