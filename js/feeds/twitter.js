// Twitter fetch code lives in here
var tw = new Twitter();
tw.stream();
function Twitter() {

    var fs = require('fs'),
        util = require('util'),
        twitter = require('twitter'),
        config = JSON.parse(fs.readFileSync('config/twitter.json'));

    var twit = new twitter(config);

    this.stream = function(){
        twit.stream('statuses/filter', {'track' : 'hack'}, function(stream) {
            stream.on('data', function(data) {
                //console.log(util.inspect(data));
                console.log(data.text);
                stream.destroy();
            });
            //setTimeout(stream.destroy, 5000);
        });

    };

    var save = function(){

    };
}