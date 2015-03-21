/**
 * Created by joe on 3/20/15.
 */
var Bugspots = require('bugspots');

var scanner = new Bugspots();

var processResults = function(err, hotspots) {
    hotspots.forEach(function(hotspot) {
      console.log(hotspot.file + '\t' + hotspot.score);
    })
};

var options = {
    repo: '/home/joe/git/github/django/django-trunk',
    regex: /\b(fix(es|ed)?|close(s|d)?)\b/i
};

scanner.scan(options, processResults);


