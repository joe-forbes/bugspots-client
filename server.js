/**
 * Created by joe on 3/20/15.
 */
var Bugspots = require('bugspots');

var scanner = new Bugspots();

var processResults = function(err, hotspots) {
    console.log('hi, joe');
};

var options = {
    repo: '/home/joe/git/github/django', // this is the location of the repo.
    branch: 'trunk', // this is the branch you want to scan.
    depth: 100, // not implemented, as it is not implemented in the gem.
    regex: '.*' // regular expression to use to match commits to use.
};

scanner.scan(options, processResults);


