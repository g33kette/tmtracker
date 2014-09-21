// Twitter fetch code lives in here
//call twitterObj.stream(string) to search when ready
//new TwitterRest().stream('kitten');
function TwitterRest(){
    var self = this;
    var fs = require('fs'),
        util = require('util'),
        twitter = require('twitter'),
        config = JSON.parse(fs.readFileSync('config/twitter.json')),
        mongo = require('../output/mongodb.js');


    var twit = new twitter(config);

    this.stream = function(filter)
    {
        mongo.connect(function() {
            mongo.find({'filter': filter, 'source': 'twitterrest'}, function (results) {
                var filter_obj;
                var params = { count: 10 };
                if (results.length) {
                    filter_obj = results[0];
                    params.since_id = filter_obj.since_id;
                    if (typeof filter_obj.max_id != 'undefined') {
                        params.max_id = filter_obj.max_id;
                        if (params.max_id < params.since_id) {
                            params.since_id = params.max_id;
                        }
                    }
                } else {
                    filter_obj = {'filter': filter, 'source': 'twitterrest'};
                }
                twit.search(filter_obj.filter, params, function (data) {
                    if (typeof data.search_metadata != 'undefined') {
                        filter_obj.since_id = data.search_metadata.max_id_str;
                        mongo.save(filter_obj, 'filters');
                        for (var i in data.statuses) {
                            if (data.statuses.hasOwnProperty(i)) {
                                process(data.statuses[i]);
                            }
                        }
                        if (typeof params.since_id != 'undefined' && (typeof params.max_id == 'undefined' || params.since_id < params.max_id)) {
                            setTimeout(function () {
                                self.stream(filter);
                            }, 10000);
                        }
                    } else {
                        console.log('twitterrest connection error', data);
                    }
                });
            }, 'filters');
        });
    };

    var save = function(data){
        mongo.connect(function(){
            mongo.save(data);
            console.log('twitterrest ' + data._id);
        });
    };

    var process = function(tweet){
        save({
            'url': 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
            'text': tweet.text,
            'timestamp_ms': new Date(tweet.created_at).getTime(),
            'timestamp_iso': new Date(tweet.created_at),
            'source_id': tweet.id,
            'source': 'twitter',
            'twitter_retweet_count': tweet.retweet_count
        });
    };
}
exports.name = TwitterRest;
module.exports = new TwitterRest();
