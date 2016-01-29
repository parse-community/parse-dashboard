// Hacky way to get classnames out of a SASS/CSS file
// This should work for our testing needs

module.exports = function(src) {
  if (!src) {
    return {};
  }

  var classMatch = src.match(/\.([a-zA-Z]\w*)\s*\{/g);
  var classMap = {};
  if (classMatch) {
    for (var i = 0; i < classMatch.length; i++) {
      var c = classMatch[i].replace(/[^a-zA-Z0-9\-_]/g, '');
      classMap[c] = c;
    }
  }
  return classMap;
};
