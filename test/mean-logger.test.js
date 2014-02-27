var should = require('should');
var express = require('express');
var logger = require('../index');
var mongoose = require('mongoose');
var http = require('http');

function fetch(port, path, done) {
  var page = [];
  var req = http.get('http://localhost:' + port + path, function(res) { 
    if (res.statusCode != 200) return done(new Error('Status code ' + res.statusCode));
    res.setEncoding('utf8');
    res.on('data', function(ch) { page.push(ch); });
    res.on('error', function(e) { done(e); });
    res.on('end', function() {
      done(null, page.join(''));
    });
  });
  req.on('error', function(e) {
    done(e);
  });
  req.end();
}


describe('mean-logger', function() {
  var app = express();
  var server;
  var coll;
  var port = 4003;
  before(function(done) {
    mongoose.connect('mongodb://localhost/mean-logger-test', function(err) {
      if(err) return done(err);
      mongoose.connection.db.createCollection('logs', function(err, coll_) {
        if (err) return done(err);
        coll = coll_;

        var passport = {};
        logger.init(app, passport, mongoose);
        app.use(app.router);
        server = app.listen(port, function() {
          done();
        });
      });
    });
  });

  after(function(done) {
    server.close(function(err1) {
      mongoose.connection.db.dropDatabase(function(err2) {
        done(err1 || err2);
      });
    });
  });

  beforeEach(function(done) {
    coll.remove(done);
  });

  it('is initially empty', function(done) {
    fetch(port, '/logger/show', function(err, body) {
      if(err) return done(err);
      var content = JSON.parse(body);
      content.should.eql([]);
      done();
    });
  });
  it('recrods a new item when /logger/log is accessed', function(done) {
    fetch(port, '/logger/log', function(err, body) {
      if (err) return done(err);
      fetch(port, '/logger/show', function(err, body) {
        if(err) return done(err);
        var content = JSON.parse(body);
        content.should.have.length(1);
        content[0].should.have.property('__v');
        content[0].should.have.property('_id');
        content[0].should.have.property('created');
        done();
      });
    });
  });
  it('takes the log message from the "?msg" query param', function(done) {
    fetch(port, '/logger/log?msg=some_message', function(err, body) {
      if (err) return done(err);
      fetch(port, '/logger/show', function(err, body) {
        if(err) return done(err);
        var content = JSON.parse(body);
        content.should.have.length(1);
        content[0].should.have.property('message', 'some_message');
        done();
      });
    });
  });
  it('shows the logged message in reverse chronological order (recent first)', function(done) {
    fetch(port, '/logger/log?msg=first', function(err, body) {
      if (err) return done(err);
      fetch(port, '/logger/log?msg=second', function(err, body) {
        if (err) return done(err);
        fetch(port, '/logger/show', function(err, body) {
          if(err) return done(err);
          var content = JSON.parse(body);
          content.should.have.length(2);
          content[0].should.have.property('message', 'second');
          content[1].should.have.property('message', 'first');
          done();
        });
      });
    });
  });
});
