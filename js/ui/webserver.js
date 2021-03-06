var mongo = require('../output/mongodb.js');
mongo.connect(function(){});

//basic webserver
function UI(twitter, guardian, twitterrest)
{
    var self = this;
    var express = require('express');
    var app = express();
    var currentSearch = '';

    app.get('/', function(req, res)
    {
        self.showIndex(req, res);
    });

    var server = app.listen(3000, function()
    {
        console.log('Server listening on port %d', server.address().port);
    });

    this.getMenuBarHTML = function()
    {
        var html = '<style>body{ margin-top: 30px; } .menu { padding: 5px 0; background: #333; color: #ddd; margin: 0; position: fixed; top: 0; left: 0; width: 100%} .menu li{float: left; padding-left: 20px; list-style-type: none}</style>'
            + '<ul class="menu"><li><a href="/">Change Filter</a></li><li><a href="/minutes">View Pretties</a></li></ul>';
        return html;
    };

    //todo: templates. for now, raw powa of html! wooo
    this.showIndex = function(req, res)
    {
        try
        {
            if(req.query.searchFor)
            {
                //twitter.destroy();
                currentSearch = req.query.searchFor;
                twitter.stream(currentSearch);
                guardian.stream(currentSearch);
                twitterrest.stream(currentSearch);
                console.log('changing search filters to ', currentSearch);
            }
        }
        catch(err)
        {
            //do nothing, default is nothing
        }

        var html = '<!doctype html><html><head><link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" /></head><body><div class="container"><h1>TMTracker</h1>'
            + this.getMenuBarHTML()
            + '<form method="get" action="/">'
            + '<input type="text" name="searchFor" value="' + currentSearch + '"> Enter string to search for like '
            + '<a href="?searchFor=kitten">kitten</a>, '
            + '<a href="?searchFor=hackference">hackference</a> or '
            + '<a href="?searchFor=paypal">PayPal</a>'
            + '<br />'
            + '<input type="submit" value="Click Meh!">'
            + '</form></div></body></html>';

        res.send(html);
    };

    app.get('/wipe', function(req, res)
    {
        mongo.dropAllCollections();
        res.send("ITS DEAD JIM!");
    });

    app.get('/content', function(req,res) {
        content_list(req.query, function(html){
            res.send(html);
        });
    });

    function content_list(query, cb, limit){
        var find = {"timestamp_iso": {$exists: true}, 'filter' : currentSearch};
        if(typeof query.relatedTerm != 'undefined') {
            find = {"datatxt_nex.annotations.title": query.relatedTerm};
        }
        if(typeof query.source != 'undefined') {
            find.source = query.source;
        }
        if (typeof limit == 'undefined') {
            limit = 0;
        }
        mongo.find(find, function(results) {
            var html = '';
            if (results.length) {
                if (limit && limit >= results.length) {
                    html += '<p>List of '+results.length+' most recent.</p>';
                } else {
                    html += '<p>Total: '+results.length+'</p>';
                }
                html += '<table><tr><th></th><th>Date</th><th>URL</th><th>Text</th></tr>';
                for (var i in results) {
                    if (results.hasOwnProperty(i)) {
                        var date = new Date(results[i].timestamp_ms);
                        html += '<tr>';
                        html += '<td>'+(parseInt(i)+1)+'</td>';
                        html += '<td>'+date.toUTCString()+'</td>';
                        html += '<td><a href="'+results[i].url+'" target="_blank">'+results[i].url+'</a></td>';
                        html += '<td>'+((typeof results[i].text != 'undefined')?results[i].text:'')+'</td>';
                        html += '</tr>';
                    }
                }
                html += '</table>';
            } else {
                html += 'Nothing found.';
            }
            cb(html);
        }, null, {'limit' : limit, 'sort': [['timestamp_ms','desc']]});
    }

    app.get('/minutes', function(req, res) {
        mongo.distinct('datatxt_nex.annotations.title', function(related_data) {
        var find = {"timestamp_iso": {$exists: true}};
        if(req.query.relatedTerm) {
            find = {"timestamp_iso": {$exists: true}, "datatxt_nex.annotations.title": req.query.relatedTerm};
        }
        if(req.query.source) {
            find.source = req.query.source;
        }
        content_list(req.query, function(content_list_html){
            mongo.aggregate([
                {$match: find},
                {$project: {
                    minutes: {$minute: "$timestamp_iso"},
                    hour: {$hour: "$timestamp_iso"},
                    day: {$dayOfMonth: "$timestamp_iso"},
                    month: {$month: "$timestamp_iso"},
                    year: {$year: "$timestamp_iso"},
                    score: "$sentiment.score"
                }},
                {$group: {
                    _id: {year: "$year", month: "$month", day: "$day", hour: "$hour", minute: "$minutes"},
                    score: {$avg: "$score"},
                    count: {$sum: 1}
                }},
                    {$sort: {
                        "_id": 1
                    }}
            ], function(data) {
                    var sourceQuery = '';
                    if (req.query.source) {
                        sourceQuery = 'source='+req.query.source+'&';
                    }
                    var html = '';
                    html += '<!DOCTYPE html>';
                    html += '<html>';
                    html += '<head>';
                    html += '<meta charset="utf-8">';
                    html += '<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" />';
                    html += '<style>.domain {fill: none; stroke: black; stroke-width: 1} #sidebar { float: right;width: 300px; }</style>';
                    html += '</head>';
                    html += '<body>';
                    html += self.getMenuBarHTML();
                    html += '<div id="demo"></div>';
                    html += '<div id="sidebar">';
                    html += '<div id="sources"><h3>Sources</h3>';
                    html += '<a href="/minutes">(( Everything ))</a><br />';
                    html += '<a href="/minutes?source=twitter">Twitter</a><br />';
                    html += '<a href="/minutes?source=guardian">Guardian</a><br />';
                    html += '</div>';
                    html += '<div id="related_terms"><h3>Related Terms</h3>';
                    html += '<a href="/minutes?'+sourceQuery+'">(( Everything ))</a><br />';
                    for (var i = 0; i < related_data.length; i++) {
                        html += '<a href="/minutes?'+sourceQuery+'relatedTerm=' + related_data[i] + '">' + related_data[i] + "</a><br />";
                    }
                    html += '</div>';
                    html += '</div>';
                    html += '<script src="http://d3js.org/d3.v3.js"></script>';
                    html += '<script>JSONData = ' + JSON.stringify(data) + ';</script>';
                    html += '<script>';
        html += 'var margin = {top: 20, right: 20, bottom: 30, left: 50},\
            width = 700 - margin.left - margin.right,\
            height = 500 - margin.top - margin.bottom;\
        \
        var parseDate = d3.time.format("%Y-%m-%d").parse;\
        \
        \
        var x = d3.time.scale()\
            .range([0, width]);\
        \
        var y = d3.scale.linear()\
            .range([height, 0]);\
        \
        var xAxis = d3.svg.axis()\
            .scale(x)\
            .orient("bottom");\
        \
        var yAxis = d3.svg.axis()\
            .scale(y)\
            .orient("left");\
        \
        var line = d3.svg.line()\
            .x(function(d) { return x(new Date(d._id.year, d._id.month, d._id.day, d._id.hour, d._id.minute)); })\
            .y(function(d) { return y(d.score); })\
            .interpolate("basis");\
        \
        var svg = d3.select("body").append("svg")\
            .attr("width", width + margin.left + margin.right)\
            .attr("height", height + margin.top + margin.bottom)\
            .append("g")\
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");\
        \
          x.domain(d3.extent(JSONData, function(d) { return new Date(d._id.year, d._id.month, d._id.day, d._id.hour, d._id.minute); }));\
          y.domain(d3.extent(JSONData, function(d) { return d.score; }));\
        \
          svg.append("g")\
              .attr("class", "x axis")\
              .attr("transform", "translate(0," + height + ")")\
              .call(xAxis);\
        \
          svg.append("g")\
              .attr("class", "y axis")\
              .call(yAxis)\
              .append("text")\
              .attr("transform", "rotate(-90)")\
              .attr("y", 6)\
              .attr("dy", ".71em")\
              .style("text-anchor", "end");\
        \
        svg.append("text")\
            .attr("class", "x label")\
            .attr("text-anchor", "end")\
            .attr("x", width)\
            .attr("y", height - 6)\
            .text("Time/Date");\
        \
        svg.append("text")\
            .attr("class", "y label")\
            .attr("text-anchor", "end")\
            .attr("y", 6)\
            .attr("dy", ".75em")\
            .attr("transform", "rotate(-90)")\
            .text("Rating (sentiment)");\
        \
        svg.append("text")\
                .attr("x", (width / 2))             \
                .attr("y", 10 - (margin.top / 2))\
                .attr("text-anchor", "middle")  \
                .style("font-size", "16px") \
                .style("text-decoration", "underline")  \
                .text("Sentiments on '+currentSearch+'");\
        \
          svg.append("path")\
              .datum(JSONData)\
              .attr("class", "line")\
              .attr("d", line)\
              .attr("stroke", "black")\
              .attr("stroke-width", 2)\
              .attr("fill", "none");';

                    html += '</script>';
                    html += '<div id="content_list">'+content_list_html+'</div>';
                    html += '</body>';
                    html += '</html>';
                    res.send(html)
                });
            },50);
        });
    });
}
module.exports = UI;
