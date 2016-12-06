'use strict';

var csso = require('csso');
var utils = require('./utils');
var noop = require('./utils').noop;



function cssHandle(source, context) {
  let ast = csso.parse(source.fileContent);
  csso.walk(ast, function (node) {
    if (this.declaration !== null && node.type === 'Url') {
      var value = node.value;
      if (value.type === 'Raw') {

      } else {
        //1.祛除" '
        let _url = value.value.replace(/\"|\'/g, "");

        let load = require('./load');
        let path = require('path');
        let obj = {};
        obj.filepath = utils.getSourcepath(_url, source.filepath, context.rootpath);
        obj.extension = path.extname(obj.filepath).slice(1);
        obj.format = utils.getFormatFromExtension(obj.extension);
        obj.type = 'image';
        load(obj);
        let data = new Buffer(obj.fileContent).toString('base64');
        let src = 'data:image/' + obj.format + ';base64,' + data;
        value.value = `"${src}"`;
      }
    }
  });
  source.fileContent = csso.translate(ast);
}



/**
 * Handle CSS content
 * @param {Object} source
 * @param {Object} context
 * @param {Function} [next]
 * @returns {null}
 */
module.exports = function css(source, context, next) {
  // Handle sync
  next = next || noop;

  if (source.fileContent
    && !source.content
    && (source.type == 'css')) {
    try {
      cssHandle(source, context);
      source.content = source.compress
        ? csso.minify(source.fileContent).css
        : source.fileContent;
      // Change tag type
      source.tag = 'style';
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
};