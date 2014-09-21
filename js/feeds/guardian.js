// Twitter fetch code lives in here
//var gd = new Guardian();
//gd.stream('kitten');
//gd.test();
function Guardian(){
    var self = this;
    var fs = require('fs'),
        util = require('util'),
        config = JSON.parse(fs.readFileSync('config/twitter.json')),
        http = require('http'),
        mongo = require('../output/mongodb.js'),
        start_time = 1396310400000, // 1st April 2014
        page = 1,
        total_pages = 1;

    function dateFromMicro(time) {
        var date;
        if (typeof time == 'undefined') {
            date = new Date();
        } else {
            date = new Date(time);
        }
        return date.getUTCFullYear()+'-'+(date.getUTCMonth()+1)+'-'+date.getUTCDate();
    }

    this.stream =    function(filter){
        var config = JSON.parse(fs.readFileSync('./config/guardian.json'));
        var options = {
            host: 'content.guardianapis.com',
            path: '/search?api-key='+config.api_key+'&page='+page+'&from-date='+dateFromMicro(start_time)+'&q='+filter
        };

        // Send the response to the classification server
        http.request(options, function(res) {
            var str = '';

            // Handle chunks of data coming back
            res.on('data', function (chunk) {
                str += chunk;
            });

            // Handle when we have all data back
            res.on('end', function() {
                var data = JSON.parse(str);
                process(data.response);
                page++;
                total_pages = data.response.pages;
                if (page > total_pages) {
                    total_pages = 1;
                    page = 1;
                    start_time = new Date().getTime();
                    timeout = 3600000; // 1 hour
                } else {
                    timeout = 1000; // 1 second
                }
                setTimeout(function(){ self.stream(filter); }, timeout);
            });
        }).end();
    };

    var process = function(data){
        if (typeof data.results != 'undefined' && data.results.length) {
            for (var i in data.results) {
                if (data.results.hasOwnProperty(i)) {
                    save({
                        'text' : data.results[i].webTitle,
                        'url' : data.results[i].webUrl,
                        'timestamp_ms': new Date(data.results[i].webPublicationDate).getTime(),
                        'timestamp_iso': new Date(),
                        'source_id': data.results[i].id,
                        'source': 'guardian'
                    });
                }
            }
        }
    };

    var save = function(data){
        mongo.connect(function(){
            mongo.save(data);
            console.log('guardian ' + data._id);
        });
    };
}
