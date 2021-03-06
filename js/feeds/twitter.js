// Twitter fetch code lives in here
//call twitterObj.stream(string) to search when ready

function Twitter(){
    var self = this;
    var fs = require('fs'),
        util = require('util'),
        twitter = require('twitter'),
        config = JSON.parse(fs.readFileSync('config/twitter.json')),
        mongo = require('../output/mongodb.js'),
        search_filter = '';


    var twit = new twitter(config);

    this.stream = function(filter)
    {
        this.destroy();
        search_filter = filter;
        twit.stream('statuses/filter', {'track' : filter}, function(stream) {
            stream.on('data', function(data) {
                process(data);
            });
            stream.on('error', function(data)
            {
                //needed to handle any errors and not fatally kill node
            });
            self.twitterStream = stream;
        });
    };

    this.destroy = function()
    {
        if(this.twitterStream)
        {
            this.twitterStream.destroy();
        }
    };

    var save = function(data){
        mongo.connect(function(){
            data.filter = search_filter;
            mongo.save(data);
            mongo.find({'filter': search_filter, 'source': 'twitterrest'}, function (results) {
                var twitterest;
                if (results.length) {
                    twitterest = results[0];
                } else {
                    twitterest = {'filter': search_filter, 'source': 'twitterrest', 'max_id': data.source_id};
                }
                mongo.save(twitterest,'filters');
            }, 'filters');
            console.log('twitter ' + data._id);
        });
    };

    var process = function(tweet){
        //console.log(tweet.retweeted_status);
        if (typeof tweet.retweeted_status == 'undefined') {
            save({
                'url': 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                'text': tweet.text,
                'timestamp_ms': parseInt(tweet.timestamp_ms),
                'timestamp_iso': new Date(parseInt(tweet.timestamp_ms)),
                'source_id': tweet.id,
                'source': 'twitter',
                'twitter_retweet_count': tweet.retweet_count
            });
        } else {
            mongo.connect(function() {
                mongo.find({'source': 'twitter', 'source_id': tweet.retweeted_status.id}, function(data){
                        if (typeof data != 'object' || !data.length) {
                            tweet = tweet.retweeted_status;
                            save({
                                'url': 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                                'text': tweet.text,
                                'timestamp_ms': tweet.timestamp_ms,
                                'source_id': tweet.id,
                                'source': 'twitter',
                                'twitter_retweet_count': tweet.retweet_count
                            });
                        } else {
                            data[0].twitter_retweet_count = tweet.retweeted_status.retweet_count;
                            save(data[0]);
                        }
                });

            });
        }


    };
}
exports.name = Twitter;
module.exports = new Twitter();
