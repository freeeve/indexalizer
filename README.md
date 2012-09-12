indexalizer
===========

index analyzer for mongodb

usage
===========

Step 1: In the db you'd like to analyze, from the mongo shell, run `db.setProfilingLevel(2);` 
(be careful if you're doing this in a production system, because it will affect performance)

Step 2: So far this only has a couple of hours put into it--a lot more to come. For now, you can copy the javascript in
indexStats.js into the mongo shell, and then run `db.indexStats()`. It will provide you with a list of indexes that aren't being used,
as well as a list of queries that aren't using any indexes (which might not be the end of the world).

tips
===========

You may need to increase your profile collection size (it's a capped collection), if you want full results.

See: http://www.mongodb.org/display/DOCS/Database+Profiler#DatabaseProfiler-Changingthesystem.profileCollectionSize

example run
===========

```JavaScript
skeweredrook:PRIMARY> db.indexStats();
scanning profile with 753 records... this could take a while.
checking for unused indexes in: positions
this index is not being used: 
"priority_1"
this index is not being used: 
"minMoves_1"
this index is not being used: 
"maxDepth_1_forcedDraw_1_claimed_1_priority_-1_minMoves_1_bestScore_1"
```

license LGPL
===========
Copyright 2012 Wes Freeman

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with this program. If not, see http://www.gnu.org/licenses/