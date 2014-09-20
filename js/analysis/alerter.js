var fs = require('fs');
var http = require('https');
var mongo = require('../output/mongodb.js');
mongo.connect(function(){AlerterRunner();});

function AlerterRunner()
{
    var txtconfig = JSON.parse(fs.readFileSync('./config/alerter.json'));
    var emergency = {
        "sentiment.score": {$lt: txtconfig.low_emergency_threshold},
        "timestamp_ms":    {$gt: (new Date().getTime()) - (txtconfig.interval * 60 * 1000)}
    }

    var average = [
        {$match: {"timestamp_ms": {$gt: (new Date().getTime()) - (txtconfig.interval * 60 * 1000)}}},
        {$group: {_id: "", avgScore: {$avg: "$sentiment.score"}}} 
    ];

    mongo.find(emergency, AlerterRunnerEmergencyCallback);
    mongo.aggregate(average, AlerterRunnerAverageCallback);


    setTimeout(AlerterRunner, txtconfig.interval * 60 * 1000);
}

function AlerterRunnerEmergencyCallback(data)
{
    if (data.length > 0) {
        console.log("SENDING SMS");
        var txtconfig = JSON.parse(fs.readFileSync('./config/alerter.json'));

        var query_string = 'To='+txtconfig.recipient+'&From='+txtconfig.sender+'&Body=';
        query_string += 'EMERGENCY! You have got some feedback which falls below the low score threshold.';

        // Set up some URL call parameters
        var options = {
            host: 'api.twilio.com',
            path: '/2010-04-01/Accounts/'+txtconfig.twilio_account+'/Messages.json',
            auth: txtconfig.twilio_account + ':' + txtconfig.twilio_secret,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': query_string.length
            }           
        };

        // Send the response to the classification server
        var post_req = http.request(options, function(res) {
            var str = '';

            // Handle chunks of data coming back
            res.on('data', function (chunk) {
                str += chunk;
            });

            // Handle when we have all data back
            res.on('end', function() {
                console.log(str);
            });
        });
        post_req.write(query_string);
        post_req.end();
    }
}

function AlerterRunnerAverageCallback(data)
{
    var txtconfig = JSON.parse(fs.readFileSync('./config/alerter.json'));
    if (data[0].avgScore < txtconfig.low_average_threshold) {
        console.log("SENDING SMS");

        var query_string = 'To='+txtconfig.recipient+'&From='+txtconfig.sender+'&Body=';
        query_string += 'Your average feedback falls below the low score threshold.';

        // Set up some URL call parameters
        var options = {
            host: 'api.twilio.com',
            path: '/2010-04-01/Accounts/'+txtconfig.twilio_account+'/Messages.json',
            auth: txtconfig.twilio_account + ':' + txtconfig.twilio_secret,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': query_string.length
            }           
        };

        // Send the response to the classification server
        var post_req = http.request(options, function(res) {
            var str = '';

            // Handle chunks of data coming back
            res.on('data', function (chunk) {
                str += chunk;
            });

            // Handle when we have all data back
            res.on('end', function() {
                console.log(str);
            });
        });
        post_req.write(query_string);
        post_req.end();
    }
}
