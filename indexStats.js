DB.prototype.indexStats = function() {
  var queries = [];
  var collections = db.getCollectionNames();
  // this could probably be made better, caching by index used instead of exact query 
  // (because queries on _id for example can be all over the place)
  var findQuery = function(q) {
    for(entryIdx in queries) {
      if(q == queries[entryIdx].query) {
        return entryIdx;
      }
    }
    return -1;
  }

  for(cIdx in collections) {
    var cName = collections[cIdx];
    if(cName.indexOf("system") == -1) {
      var i = 1;
      var count = db.system.profile.count({ns:db.getName()+"."+cName});
      print("scanning profile with "+count+" records... this could take a while.");
      db.system.profile.find({ns:db.getName()+"."+cName}).addOption(16).batchSize(10000).forEach(function(profileDoc) {
        if(profileDoc.query && !profileDoc.query["$explain"]) { 
          var qIdx = findQuery(profileDoc.query);
          if(qIdx == -1) {
            var size = queries.push({query:profileDoc.query, count:1, index:""});
            var explain = db[cName].find(queries[size-1].query).explain();
            if(profileDoc.query && profileDoc.query["query"]) {
              queries[size-1].sort = profileDoc.query['orderby'];
              if(queries[size-1].sort) {
                explain = db[cName].find(queries[size-1].query.query).sort(queries[size-1].sort).explain();
              }
            }
            queries[size-1].cursor = explain.cursor;
            queries[size-1].millis = explain.millis;
            queries[size-1].nscanned = explain.nscanned;
            queries[size-1].n = explain.n;
            if(explain.cursor != "BasicCursor") {
              queries[size-1].index = explain.cursor.split(" ")[1];
              //print("found index in use: " + queries[size-1].index); 
            } else {
              print("warning, no index for query: ");
              printjson(profileDoc.query);
              print("... millis: " + queries[size-1].millis);
              print("... nscanned/n: " + queries[size-1].nscanned + "/" + queries[size-1].n);
            }
          } else {
            queries[qIdx].count++;
          }
        }
      });
    }
  }

  for(cIdx in collections) {
    var cName = collections[cIdx];
    if(cName.indexOf("system") == -1) {
      print("checking for unused indexes in: " + cName);
      for(iIdx in db[cName].getIndexes()) {
        var iName = db[cName].getIndexes()[iIdx].name;
        if(iName.indexOf("system") == -1) {
          var stats = db[cName].stats();
          var found = false;
          for(qIdx in queries) {
            if(queries[qIdx].index == iName) {
              found = true;
              break;
            }
          }
          if(!found) {
            print("this index is not being used: ");
            printjson(iName);
          }
        }
      }
    }
  }
}
