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
  branch: 'stable/1.7.x',
  regex: /\b(fix(es|ed)?|close(s|d)?)\b/i,
  useRelativeDates: true,
//  markerCommitId: '159f3bfafced8b546010caeaafabecf735598e34', //1.7.7
//  markerCommitId: '40fb8f4ecd740cbfc2b2c3651d69cbbb3cc2506b', //1.7.6
//  markerCommitId: '634f4229c5cafeb3a1c03e5deb9434d7c0f74ebe', //1.7.5
//  markerCommitId: 'b626c289ccf9cc487f97d91c2a45cac096d9d0c7', //1.7.4
//  markerCommitId: '6bf1930fb5c7c6a47992ff368e21c58f4f14b402', //1.7.3
//  markerCommitId: '880d7638cf66ed28a60b62335ccfc5dfd5052937', //1.7.2
//  markerCommitId: 'c5780adeecfbd85a80b5aa7130dd86e78b23e497', //1.7.1
  markerCommitId: 'd92b08536d873c0966e8192e64d8e8bd9de79ebe', //1.7
  depth: 5000,
  batchSize: 100
};

var messageBasedCommitInclusionDecisionHandler = function (commit) {
  return options.regex.test(commit.message);
};

var linkedTracIssueTypeCommitInclusionDecisionHandler = function (commit) {

  var s = commit.message.split('#');

  if (s.length < 2) return false;

  var tracId = 'does not exist';
  var poundSign = 1;

  // get number
  while (poundSign < s.length && !tracList[tracId]) {
    var m = s[poundSign].match(/^(\d*).*/);
    if (m) tracId = m[1];
    poundSign++;
  }

  if (!tracList[tracId]) {
    console.error('Unable to find issue ' + tracId + ' referenced by commit ' + commit.id);
    return false;
  }

  var tracItem = tracList[m[1]];

  return !!('bug' == tracItem.type.toLowerCase() || 'defect' == tracItem.type.toLowerCase());

};

var tracList = {};

var LineByLineReader = require('line-by-line'),
  lr = new LineByLineReader('tracDump.csv');

lr.on('error', function (err) {
  console.error('error reading tracDump:' + err);
});

lr.on('line', function (line) {
  // 'line' contains the current line without the trailing newline character.
  var fields = line.split(',');
  tracList[fields[0]] = {
    summary: fields[1] || '',
    status: fields[2] || '',
    owner: fields[3] || '',
    type: fields[4] || '',
    component: fields[5] || '',
    version: fields[6] || '',
    resolution: fields[7] || '',
    time: fields[8] || '',
    changetime: fields[9] || ''
  };
});

lr.on('end', function () {
  // All lines are read, file is closed now.
  scanner.scan(options, processResults, linkedTracIssueTypeCommitInclusionDecisionHandler);
});



