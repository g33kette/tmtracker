// Classification (datatxt-CL) code lives in here
var fs = require('fs');
var http = require('http');
var mongo = require('../output/mongodb.js');
mongo.connect(function(){DataTxtClRunner();});


function DataTxtClRunner()
{
    // Get stories from mongo
    mongo.find({sentiment: {$exists: true}, datatxt_cl: {$exists: false}, datatxt_cl_processing: {$exists: false}}, DataTxtClRunnerCallback);
}

function DataTxtClRunnerCallback(entries)
{
    // Load in config for datatxt
    var txtconfig = JSON.parse(fs.readFileSync('./config/datatxt.json'));

    var len = entries.length;

    // Iterate the stories
    for (var i = 0; i < len; i++) {
        story = entries[i];

        // Mark story as processing
        story.datatxt_cl_processing = true;
        mongo.save(story)

        // Set up some URL call parameters
        var options = {
            host: txtconfig.url,
            path: '/datatxt/cl/v1?$app_id=' + txtconfig.app_id + '&$app_key=' + txtconfig.app_key + '&model=648b9f89-b869-4639-9386-5493bfb7a84d&text=' + encodeURIComponent(story.text)
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
                story.datatxt_cl = JSON.parse(str);
                story.datatxt_cl_processing = false;

                // Save story to mongo
                mongo.save(story)
            });
        }).end();
    }

    // Wait for 100ms then run again
    setTimeout(DataTxtClRunner, 100);
}

