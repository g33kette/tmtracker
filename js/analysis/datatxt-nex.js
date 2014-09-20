// Classification (datatxt-CL) code lives in here
var fs = require('fs');
var http = require('http');
var mongo = require('../output/mongodb.js');
mongo.connect(function(){DataTxtNexRunner();});

function DataTxtNexRunner()
{
    // Get stories from mongo
    mongo.find({sentiment: {$exists: true}, datatxt_nex: {$exists: false}, datatxt_nex_processing: {$exists: false}}, DataTxtNexRunnerCallback);
}

function DataTxtNexRunnerCallback(entries)
{
    // Load in config for datatxt
    var txtconfig = JSON.parse(fs.readFileSync('./config/datatxt.json'));

    var len = entries.length;

    // Iterate the stories
    for (var i = 0; i < len; i++) {
        story = entries[i];

        // Mark story as processing
        story.datatxt_nex_processing = true;
        mongo.save(story)

        // Set up some URL call parameters
        var options = {
            host: txtconfig.url,
            path: '/datatxt/nex/v1/?min_confidence=0.6&social.parse_hashtag=False&text=' + encodeURIComponent(story.text) + '&include=image%2Cabstract%2Ctypes%2Ccategories%2Clod&country=-1&$app_id=' + txtconfig.app_id + '&$app_key=' + txtconfig.app_key
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
                story.datatxt_nex = JSON.parse(str);
                story.datatxt_nex_processing = false;

                // Save story to mongo
                mongo.save(story)
            });
        }).end();
    }

    // Wait for 100ms then run again
    setTimeout(DataTxtNexRunner, 100);
}

