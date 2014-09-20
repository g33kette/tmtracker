var mongo = require('./js/output/mongodb.js');

require('./js/feeds/twitter.js');
require('./js/feeds/guardian.js');

require('./js/analysis/sentiment.js');
require('./js/analysis/datatxt-nex.js');
require('./js/analysis/datatxt-cl.js');


/**
 * Input should normalise to the following format:
 *
 * text
 * url
 * related content
 */
