const path = require('path');

module.exports = function(source) {
  return source.replace(/(\>)(\s+)|(\s+)(\<)/g, '$1$4');
};