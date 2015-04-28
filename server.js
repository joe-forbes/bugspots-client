'use strict';
var configger = require("./util/configger");
var config = configger.load();
if (!config.hasOwnProperty('tracListFile') && (config.bugspotsOptions.regexSpec)) {
  config.bugspotsOptions.regex = new RegExp(config.bugspotsOptions.regexSpec.pattern, config.bugspotsOptions.regexSpec.options);
}

var logger = require('./util/logger');
logger.addTargets(config.loggingTargets);

var packageJson = require('./package.json');
logger.info("bugspots-client version: " + packageJson.version);
logger.debug("package.json: " + JSON.stringify(packageJson, {depth: null}));
logger.debug("config: " + JSON.stringify(config, {depth: null}));

var Bugspots = require('bugspots');
var bugspots = new Bugspots();

var fileList = null;
var tracList = {};

var commitIdsSeen = [];
var LineByLineReader = require('line-by-line');
var filesToRead = 1;

var processResults = function (err, hotspots) {
  if (err) {
    logger.error(err.message);
    return;
  }

  var hotspotRanking = 0;

  hotspots.forEach(function (hotspot) {
    if (!config.fileListFile || fileList['./' + hotspot.file]) {
      console.log([hotspot.file, ++hotspotRanking, hotspot.fixCommits, hotspot.firstCommit.toISOString(),
        hotspot.lastCommit.toISOString(), hotspot.score].join('\t'));
    } else {
      logger.debug('skipping deleted file ' + hotspot.file);
    }
  });
};

var tracIssueTypeCommitFilter = function (commit) {

  if (commitIdsSeen.indexOf(commit.id) !== -1) {
    logger.warn('Duplicate commit: ' + commit.id);
    return false;
  }

  commitIdsSeen.push(commit.id);

  var s = commit.message.split('#'),
    tracId = 'does not exist',
    poundSign = 1,
    m,
    tracItem;

  if (s.length < 2) {
    return false;
  }

  // get number
  while (poundSign < s.length && !tracList[tracId]) {
    m = s[poundSign].match(/^(\d*).*/);
    if (m) {
      tracId = m[1];
    }
    poundSign++;
  }

  if (!tracList[tracId]) {
    console.error('Unable to find issue ' + tracId + ' referenced by commit ' + commit.id);
    return false;
  }

  tracItem = tracList[m[1]];

  return !!('bug' === tracItem.type.toLowerCase() || 'defect' === tracItem.type.toLowerCase());

};

var readerEndHandler = function () {
  // All lines are read, file is closed now.
  filesToRead--;
  if (0 === filesToRead) {
    if (config.hasOwnProperty('tracListFile')) {
      bugspots.scan(config.bugspotsOptions, processResults, tracIssueTypeCommitFilter);
    } else {
      bugspots.scan(config.bugspotsOptions, processResults);
    }
  }
};

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

if (config.fileListFile) {
  fileList = {};
  filesToRead++;
  var fileListReader = new LineByLineReader(config.fileListFile);
  fileListReader.on('error', function (err) {
    logger.error(err);
    console.error('error reading fileList:' + err);
  });

  fileListReader.on('line', function (line) {
    fileList[line] = line;
  });

  fileListReader.on('end', readerEndHandler);
}

setTimeout(readerEndHandler, 10);