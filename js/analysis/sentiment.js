// Sentiment code lives in here
var sentiment = require('sentiment');

function TMSentimentRunner()
{
    // Get stories from mongo
    // var entries = mongo.find({sentiment: {$exists: false}})

    // Iterate the stories
    entries.foreach(function(story) {
        // Add sentiment
        story.sentiment = sentiment(story.text)

        // Save story to mongo
        // mongo.save(story)
    }

    // Wait for 100ms then run again
    setTimeout(TMSentimentRunner, 100);
}
setTimeout(TMSentimentRunner, 100);