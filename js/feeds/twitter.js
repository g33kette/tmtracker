// Twitter fetch code lives in here
var tw = new Twitter();
tw.stream('kitten');
function Twitter(){
    var fs = require('fs'),
        util = require('util'),
        twitter = require('twitter'),
        config = JSON.parse(fs.readFileSync('config/twitter.json')),
        mongo = require('../output/mongodb.js');

    var twit = new twitter(config);

    this.stream = function(filter){
        twit.stream('statuses/filter', {'track' : filter}, function(stream) {
            stream.on('data', function(data) {
                save(data);
                //stream.destroy();
            });
        });

    };

    var save = function(tweet){
        var data = {
            'url' : 'https://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str,
            'text' : tweet.text
        };
        mongo.connect(function(){
            mongo.save(data);
            console.log(data);
            mongo.close();
        });
    };
}