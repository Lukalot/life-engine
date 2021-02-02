module.exports = function toProperCase(str, opt_lowerCaseTheRest) {
  return (opt_lowerCaseTheRest ? str.toLowerCase() : str)
    .replace(/(^|[\s\xA0])[^\s\xA0]/g, function(s){ return s.toUpperCase(); });
};
