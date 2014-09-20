//basic webserver
function UI(twitter)
{
    var self = this;
    var express = require('express');
    var app = express();

    app.get('/', function(req, res)
    {
        self.showIndex(req, res);
    });

    var server = app.listen(3000, function()
    {
        console.log('Server listening on port %d', server.address().port);
    });

    //todo: templates. for now, raw powa of html! wooo
    this.showIndex = function(req, res)
    {
        var currentSearch = '';
        try
        {
            if(req.query.searchFor)
            {
                //twitter.destroy();
                currentSearch = req.query.searchFor;
                twitter.stream(currentSearch);
                console.log('changing search filters to ', currentSearch);
            }
        }
        catch(err)
        {
            //do nothing, default is nothing
        }

        var html = '<h1>TMTracker</h1>'
            + '<form method="get" action="/">'
            + '<input type="text" name="searchFor" value="' + currentSearch + '"> Enter string to search for like '
            + '<a href="?searchFor=kittens">kittens</a>, '
            + '<a href="?searchFor=hackference">hackference</a> or'
            + '<a href="?searchFor=paypal">PayPal</a>'
            + '<br />'
            + '<input type="submit" value="Click Meh!">'
            + '</form>';

        res.send(html);
    };
}
module.exports = UI;