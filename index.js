var mongo = require('./js/output/mongodb.js');

var twitter = require('./js/feeds/twitter.js');

var guardian = require('./js/feeds/guardian.js');

require('./js/analysis/sentiment.js');
require('./js/analysis/datatxt-nex.js');
require('./js/analysis/datatxt-cl.js');
require('./js/analysis/alerter.js');

var express = require('./js/ui/webserver.js');
webserver = new express(twitter, guardian);

/**
 * Input should normalise to the following format:
 *
 * text
 * url
 * related content
 */
