DB.prototype.indexStats = function() {
  var queries = [];
  var collections = db.getCollectionNames();
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
      db.system.profile.find({ns:db.getName()+"."+cName}).limit(10).forEach(function(profileDoc) {
        if(profileDoc.query != {}) { 
        var qIdx = findQuery(profileDoc.query);
        if(qIdx == -1) {
          var size = queries.push({query:profileDoc.query, count:1, index:""});
          var explain = db[cName].find(queries[size-1].query).explain();
          if(profileDoc.query["query"]) {
            queries[size-1].query = profileDoc.query['query'];
            queries[size-1].sort = profileDoc.query['orderby'];
            if(queries[size-1].sort) {
              explain = db[cName].find(queries[size-1].query).sort(queries[size-1].sort).explain();
              print("printing explain with sort: ");
              printjson(explain);
            }
          }
          queries[size-1].cursor = explain.cursor;
          queries[size-1].millis = explain.millis;
          if(explain.cursor != "BasicCursor") {
            queries[size-1].index = explain.cursor.split(" ")[1];
          } else {
            print("warning, no index for query: ");
            printjson(profileDoc.query);
          }
          printjson(explain);
        } else {
          queries[qIdx].count++;
        }
        }
      });
    }
  }

  for(cIdx in collections) {
    var cName = collections[cIdx];
    print("checking indexes not used in: " + cName);
    for(iIdx in db[cName].getIndexes()) {
      var iName = db[cName].getIndexes()[iIdx].name;
      print("checking if "+iName+" is being used..");
      var stats = db[cName].stats();
      var found = false;
      for(qIdx in queries) {
        if(queries[qIdx].idx == iName) {
          found = true;
          continue;
        }
      }
      if(!found) {
        print("this index is not being used: ");
        printjson(iName);
      }
    }
  }
}
