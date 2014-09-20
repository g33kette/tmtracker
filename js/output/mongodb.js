function MongoDB()
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
                self.setCollection("tmtracker");
                callback();
            }
        );
    };

    this.setCollection = function(collectionName)
    {
        if(collectionName == this.lastCollection)
        {
            return;
        }
        this.lastCollection = collectionName;
        this.collection = self.db.collection(collectionName);
    };

    this.resetCollection = function()
    {
        this.setCollection("tmtracker");
    };

    this.save = function(obj, overrideCollection)
    {
        if(typeof overrideCollection != "undefined")
        {
            this.setCollection(overrideCollection);
        }

        this.collection.save(obj, function(err, result){});
        this.resetCollection();
    };

    this.find = function(obj, cb, overrideCollection)
    {
        if(typeof overrideCollection != "undefined")
        {
            this.setCollection(overrideCollection);
        }
        this.collection.find(obj).toArray(function(err, results)
        {
            cb(results);
        });
        this.resetCollection();
    };

    this.close = function()
    {
        this.db.close();
    };
 
}
module.exports = new MongoDB();