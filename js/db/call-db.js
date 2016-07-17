/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var Dexie   = require("dexie");
var DB_NAME = "CallDb";
var CallDb  = function() { };

CallDb.prototype.init = function() {
  if (this.db !== undefined) { return }

  this.db = new Dexie(DB_NAME);
  this.db.version(1).stores({
    calls: "id,sourceId,groupId,startTime,endTime,duration"
  });
  this.db.open();
}

CallDb.prototype.putAll = function(calls, callback) {
  this.db.transaction("rw", this.db.calls, function() {
    calls.forEach(function(call) {
      call.duration = call.endTime - call.startTime;
      this.db.calls.put(call);
    }.bind(this));
  }.bind(this))
   .then(callback)
   .catch(function(error) {
    console.log("putAll() transaction error: " + error);
  });
};

CallDb.prototype.get = function(id, callback) {
  this.db.calls.get(id, callback).catch(function(error) {
    console.log("get() error: " + error);
  });
};

CallDb.prototype.query = function() {
  return this.db.calls;
};

CallDb.prototype.clear = function() {
  this.db.calls.clear();
};



module.exports = new CallDb();