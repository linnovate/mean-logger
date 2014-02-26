var should = require('should');
var express = require('express');
var logger = require('../index');
var mongoose = require('mongoose');
var http = require('http');

function fetch(address, done) {
  var page = [];
  var req = http.get(address, function(res) { 
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
  before(function(done) {
    mongoose.connect('mongodb://localhost/mean-logger-test', function(err) {
      if(err) return done(err);
      mongoose.connection.db.dropCollection('logs', function(err) {
        if (err) return done(err);
        var passport = {};
        
        logger.init(app, passport, mongoose);
        app.get('/somepage', function(req, res) {
          res.json({a: 1, b: 2});
        });
        app.use(app.router);
        server = app.listen(4003, function() {
          done();
        });
      });
    });
  });

  after(function(done) {
    server.close(done);
  });

  it('does something', function(done) {
    fetch('http://localhost:4003/somepage', function(err, body) {
      if(err) return done(err);
      var content = JSON.parse(body);
      content.should.eql({a: 1, b: 2});
      done();
    });
  });
  it('is initially empty', function(done) {
    fetch('http://localhost:4003/logger/show', function(err, body) {
      if(err) return done(err);
      var content = JSON.parse(body);
      content.should.eql([]);
      done();
    });
  });
  it('items are added via logger/log', function(done) {
    fetch('http://localhost:4003/logger/log', function(err, body) {
      if (err) return done(err);
      fetch('http://localhost:4003/logger/show', function(err, body) {
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
});
