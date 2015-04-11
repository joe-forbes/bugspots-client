/**
 * Created by joe on 3/20/15.
 */
var Bugspots = require('bugspots');

var bugspots = new Bugspots();

var logger = require('./util/logger');
var configger = require("./util/configger");
var packageJson = require('./package.json');
var config = configger.load();

if (!config.hasOwnProperty('tracListFile') && (config.bugspotsOptions.regexPattern && config.bugspotsOptions.regexOptions)) {
  config.bugspotsOptions.regex = new RegExp(config.bugspotsOptions.regexPattern, config.bugspotsOptions.regexOptions);
}

logger.addTargets(config.loggingTargets);

logger.info("bugspots-client version: " + packageJson.version);
logger.debug("config: " + JSON.stringify(config, {depth: null}));
logger.debug("package.json: " + JSON.stringify(packageJson, {depth: null}));

var commitIdsSeen = [];

var processResults = function (err, hotspots) {
  if (err) {
    logger.error(err.message);
    return;
  }

  var hotspotRanking = 0;

  hotspots.forEach(function (hotspot) {
    if (!config.fileListFile || fileList['./' + hotspot.file]) {
      hotspotRanking++
      console.log(hotspot.file + '\t' + hotspotRanking + '\t' + hotspot.fixCommits + '\t' + hotspot.firstCommit.toISOString() + '\t' + hotspot.lastCommit.toISOString() + '\t' + hotspot.score);
    } else {
      logger.debug('skipping deleted file ' + hotspot.file);
    }
  })
};

var linkedTracIssueTypeCommitInclusionDecisionHandler = function (commit) {

  if (commitIdsSeen.indexOf(commit.id) != -1) {
    logger.warn('Duplicate commitId: ' + commitId);
    return false;
  } else {
    commitIdsSeen.push(commit.id)
  }

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

var readerEndHandler = function() {
  // All lines are read, file is closed now.
  filesToRead--;
  if (0 === filesToRead) {
    if (config.hasOwnProperty('tracListFile')) {
      bugspots.scan(config.bugspotsOptions, processResults, linkedTracIssueTypeCommitInclusionDecisionHandler);
    } else {
      bugspots.scan(config.bugspotsOptions, processResults)
    }
  }
}

var tracList = {};

var LineByLineReader = require('line-by-line');
var filesToRead = 1;

if (config.tracListFile) {
  filesToRead++;
  var tracListReader = new LineByLineReader(config.tracListFile);
  tracListReader.on('error', function (err) {
    logger.error(err);
    console.error('error reading tracDump:' + err);
  });

  tracListReader.on('line', function (line) {
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

  tracListReader.on('end', readerEndHandler);
}

var fileList = null;

if (config.fileListFile) {
  fileList = {};
  filesToRead++;
  var fileListReader = new LineByLineReader(config.fileListFile);
  fileListReader.on('error', function (err) {
    logger.error(err);
    console.error('error reading fileList:' + err)
  });

  fileListReader.on('line', function(line) {
    fileList[line] = line;
  });

  fileListReader.on('end', readerEndHandler);
}

setTimeout(readerEndHandler, 10);