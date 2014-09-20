// Twitter fetch code lives in here
var tw = new Twitter();
tw.stream('hack');
function Twitter(){
    var fs = require('fs'),
        util = require('util'),
        twitter = require('twitter'),
        config = JSON.parse(fs.readFileSync('config/twitter.json'));

    var twit = new twitter(config);

    this.stream = function(filter){
        twit.stream('statuses/filter', {'track' : filter}, function(stream) {
            stream.on('data', function(data) {
                //console.log(util.inspect(data));
                //console.log(data.text);
                save(data);
                stream.destroy();
            });
            //setTimeout(stream.destroy, 5000);
        });

    };

    var save = function(tweet){
        var url = 'https://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str;
        var text = tweet.text;
        console.log(url);
        console.log(text);
    };
}