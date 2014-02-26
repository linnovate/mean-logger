var should = require('should');
var express = require('express');
var logger = require('../index');
var mongoose = require('mongoose');
var http = require('http');

describe('mean-logger', function() {
  var app = express();
  var server;
  before(function(done) {
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

  after(function(done) {
    server.close(done);
  });

  it('does something', function(done) {
    var page = [];
    var req = http.get('http://localhost:4003/somepage', function(res) { 
      res.setEncoding('utf8');
      res.on('data', function(ch) { page.push(ch); });
      res.on('error', function(e) { console.log('e=' + e); done(e); });
      res.on('end', function() {
        var content = JSON.parse(page.join(''));
        content.should.eql({a: 1, b: 2});
        done();
      });
    });
    req.on('error', function(e) {
      console.log('req.e=' + e.stack);
      done(e);
    });
    req.end();
  });
});
