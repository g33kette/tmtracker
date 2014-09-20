// Classification (datatxt-CL) code lives in here
var fs = require('fs');


function DataTxtClRunner()
{
    // Load in config for datatxt
    var txtconfig = JSON.parse(fs.readFileSync('../../config/datatxt.json'));

    // Get stories from mongo
    // var entries = mongo.find({sentiment: {$exists: true}, datatxt_cl: {$exists: false}, datatxt_cl_processing {$exists: false}})

    // Iterate the stories
    entries.foreach(function(story) {
        // Mark story as processing
        story.datatxt_cl_processing = true;
        // mongo.save(story)

        // Set up some URL call parameters
        var options = {
            host: txtconfig.url,
            port: 80,
            path: '/datatxt/cl/v1?app_id=' + txtconfig.app_id + '&app_key=' + txtconfig.app_key + '&text=' + encodeURIComponent(story.text),
            method: 'POST'
        };

        // Send the response to the classification server
        http.request(options, function(res) {
            res.setEncoding('utf8');
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
                // mongo.save(story)
            });
        }).end();
    }

    // Wait for 100ms then run again
    setTimeout(DataTxtClRunner, 100);
}
setTimeout(DataTxtClRunner, 100);
