// Sentiment code lives in here
var sentiment = require('sentiment');

function TMSentiment(story)
{
    this.story = story;
}

TMSentiment.prototype.getSentiment = function() {
    story.sentiment = sentiment(story.text);
}

module.exports = TMSentiment;
