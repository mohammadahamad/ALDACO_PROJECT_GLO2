var POI = require("./POI");

// VpfParser

var VpfParser = function (sTokenize, sParsedSymb) {
  this.parsedPOI = [];
  this.symb = []; // put symbols of ABNF here
  this.showTokenize = sTokenize;
  this.showParsedSymbols = sParsedSymb;
  this.errorCount = 0;
};

module.exports = VpfParser;
