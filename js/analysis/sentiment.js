// Sentiment code lives in here
var sentiment = require('sentiment');
var mongo = require('../output/mongodb.js');
mongo.connect(function(){TMSentimentRunner();});

function TMSentimentRunner()
{
    // Get stories from mongo
    mongo.find({sentiment: {$exists: false}}, TMSentimentHandleStory);
}

function TMSentimentHandleStory(entries)
{
    if (entries.length > 0) {
        // Iterate the stories
        entries.foreach(function(story) {
            // Add sentiment
            story.sentiment = sentiment(story.text)

            // Save story to mongo
            mongo.save(story)
        });
    }

    // Wait for 100ms then run again
    setTimeout(TMSentimentRunner, 100);
}

