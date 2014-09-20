//basic webserver
function UI()
{
    var express = require('express');
    var app = express();

    app.get('/', function(req, res)
    {
        res.send('Hello World');
    });

    var server = app.listen(3000, function()
    {
        console.log('Server listening on port %d', server.address().port);
    });
}
module.exports = new UI();