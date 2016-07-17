/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var Dexie          = require("dexie");
var DB_NAME_TOPICS = "TopicsDbTopics";
var DB_NAME_LINKS  = "TopicsDbLinks";
var TopicsDb       = function() { };

TopicsDb.prototype.init = function() {
  if (this.topicsDb !== undefined ||
      this.linksDb  !== undefined) { return }

  this.topicsDb = new Dexie(DB_NAME_TOPICS);
  this.topicsDb.version(1).stores({
    topics : "++id,name"
  });
  this.topicsDb.open();

  this.linksDb = new Dexie(DB_NAME_LINKS);
  this.linksDb.version(1).stores({
    links : "++id,topicId,callId"
  });
  this.linksDb.open();
};

TopicsDb.prototype.topics = function() {
  return this.topicsDb.topics;
};

TopicsDb.prototype.links = function() {
  return this.linksDb.links;
};

TopicsDb.prototype.createTopic = function(topicName, callback, callId) {
  var promise = this.topics().put({ name : topicName });

  if (callId === undefined) {
    callback();
  } else {
    promise.then(function() {
      this.topics().where("name").equals(topicName).first(function(topic) {
        this.links().put({
          callId  : callId,
          topicId : topic.id
        });
        callback();
      }.bind(this));
    }.bind(this));
  }
};

TopicsDb.prototype.linkCall = function(topicId, callId, callback) {
  this.links().put({
    topicId : topicId,
    callId  : callId
  }).then(callback);
};

TopicsDb.prototype.unlinkCall = function(topicId, callId, callback) {
  this.links().where("topicId").equals(topicId)
              .and(function(link) { return link.callId === callId })
              .delete().then(callback);
};

// todo: sort by call startTime
TopicsDb.prototype.linksFor = function(topicId, callback) {
  this.links().where("topicId").equals(topicId).sortBy("callId", callback);
};

TopicsDb.prototype.getTopics = function(callback) {
  this.topics().orderBy("id").toArray(callback);
};

TopicsDb.prototype.clear = function() {
  this.topics().clear();
  this.links().clear();
};


module.exports = new TopicsDb();