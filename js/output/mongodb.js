

function MONGODB()
{
    var self = this;
    this.format = require("util").format;
    this.collection = false;

    this.connect = function(callback)
    {
        var MongoClient = require("mongodb").MongoClient;
        MongoClient.connect("mongodb://localhost:27017/test",
            function(err, db)
            {
                if(err) throw err;
                self.db = db;
                self.collection = db.collection("tmtracker");
                callback();
            }
        );
    };

    this.save = function(obj)
    {
        if(!self.collection) throw "Not yet connected";
        self.collection.insert(obj, function(err, docs)
        {
            self.collection.count(function(err, count)
            {
                console.log(self.format("collection count = %s", count));
            });
        });
    };

    this.find = function(obj, cb)
    {
        if(!self.collection) throw "Not yet connected";
        self.collection.find(obj).toArray(function(err, results)
        {
            cb(results);
        });
    };

    this.close = function()
    {
        this.db.close();
    };
}

var mongoTest = new MONGODB();
mongoTest.connect(function()
{
    mongoTest.save({thisItem: "is a test"});
    mongoTest.find({a:2}, function(result){ console.log('got result', result); });
});
