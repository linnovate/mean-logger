
/*!
 * mean-logger
 * Copyright(c) 2013 Linnovate
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path');


/**
 * Initialize Logger
 *
 * @api public
 */

var Logger = exports = module.exports = function (config) {
  if (config) {
    this.config = config;
  }
}
/**
 * Logger methods
 */

Logger.prototype = {

  /**
   * Logger config
   *
   * @param {Object} config
   * @return {Logger}
   * @api public
   */

  use: function (config) {
    var self = this;

    if (!config) return
    Object.keys(config).forEach(function (key) {
      self.config[key] = config[key];
    });

    return this;
  },

  /**
   * Log message
   *
   * @param {String} message
   * @return {Logger}
   * @api public
   */

  log: function (message) {
    var config = this.config;
    console.log(message);
    return this;
  },
}
