/**
 * Created by joe on 3/20/15.
 */
var Bugspots = require('bugspots');

var scanner = new Bugspots();

var processResults = function (err, hotspots) {
  if (err) {
    console.error(err.message);
    return;
  }
  hotspots.forEach(function (hotspot) {
    console.log(hotspot.file  + '\t' + hotspot.fixCommits + '\t' + hotspot.firstCommit.toISOString() + '\t' + hotspot.lastCommit.toISOString() + '\t' + hotspot.score);
  })
};

var options = {
  repo: '/home/joe/git/github/django/django-trunk',
  regex: /\b(fix(es|ed)?|close(s|d)?)\b/i,
  useRelativeDates: true,
  depth: 5000,
  batchSize: 400
};

scanner.scan(options, processResults);


