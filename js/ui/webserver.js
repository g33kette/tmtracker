var mongo = require('../output/mongodb.js');
mongo.connect(function(){});

//basic webserver
function UI(twitter, guardian)
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
                guardian.stream(currentSearch);
                console.log('changing search filters to ', currentSearch);
            }
        }
        catch(err)
        {
            //do nothing, default is nothing
        }

        var html = '<!doctype html><html><head><link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" /></head><body><div class="container"><h1>TMTracker</h1>'
            + '<form method="get" action="/">'
            + '<input type="text" name="searchFor" value="' + currentSearch + '"> Enter string to search for like '
            + '<a href="?searchFor=kittens">kittens</a>, '
            + '<a href="?searchFor=hackference">hackference</a> or '
            + '<a href="?searchFor=paypal">PayPal</a>'
            + '<br />'
            + '<input type="submit" value="Click Meh!">'
            + '</form></div></body></html>';

        res.send(html);
    };

    app.get('/minutes', function(req, res) {
        mongo.distinct('datatxt_nex.annotations.title', function(related_data) {
        var find = {"timestamp_iso": {$exists: true}};
        if(req.query.relatedTerm) {
            find = {"timestamp_iso": {$exists: true}, "datatxt_nex.annotations.title": req.query.relatedTerm};
        }
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
            var html = '';
            html += '<!DOCTYPE html>';
            html += '<html>';
            html += '<head>';
            html += '<meta charset="utf-8">';
            html += '<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" />';
            html += '<style>.domain {fill: none; stroke: black; stroke-width: 1} #related_terms { float: right;width: 300px; height: 500px; overflow: scroll; }</style>';
            html += '</head>';
            html += '<body>';
            html += '<div id="demo"></div>';
            html += '<div id="related_terms"><h3>Related Terms</h3>';
            html += '<a href="/minutes">(( Everything ))</a><br />';
            for (var i = 0; i < related_data.length; i++) {
                html += '<a href="/minutes?relatedTerm=' + related_data[i] + '">' + related_data[i] + "</a><br />";
            }
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
        .text("Sentiments on kitten");\
\
  svg.append("path")\
      .datum(JSONData)\
      .attr("class", "line")\
      .attr("d", line)\
      .attr("stroke", "black")\
      .attr("stroke-width", 2)\
      .attr("fill", "none");';

            html += '</script>';
            html += '</body>';
            html += '</html>';
            res.send(html)
        });
    });
    });
}
module.exports = UI;
