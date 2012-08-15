var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});
var x = require('casper').selectXPath;
var fs = require('fs');
var global_songs = [];

function getSongs() {
  var songs = []
  var unclean_links = document.querySelectorAll('h3.track_name a');

  var count = 0
  while (unclean_links.length > count) {
    var artist = unclean_links[count];
    var track = unclean_links[count+1];

    artist = artist.title.slice(0, artist.title.indexOf('search hype machine for this')-3);
    console.log(artist);
    track = track.title.slice(0, track.title.indexOf('go to page for this')-3);
    console.log(track);

    var song = {};
    song.artist = artist;
    song.track = track;
    
    songs.push(song);
    count = count + 2;
  }

  return songs;
}

function clickNextOrDie(self) {
  var songs = self.evaluate(getSongs)
  global_songs = global_songs.concat(songs);
  if (self.visible(x('//a[text()="Next Page »"]'))) {
    self.clickLabel('Next Page »', 'a')
    self.emit('next.page')
  }
  else {
    casper.log("All doneee");
    write_results_to_file();
  }
};

function write_results_to_file() {
  to_write = '';
  for (var x = 0; x < global_songs.length; x++) {
    var data = global_songs[x].artist + " ;- " + global_songs[x].track;
    to_write = to_write + data + '\n';
  }

  if (!casper.cli.has('file')) {
    var filename = 'songs.txt';
  } else {
    var filename = casper.cli.get('file');
  }

  fs.write(filename, to_write, 'w');
  casper.exit(0);
}

casper.on('remote.message', function(resource) {
 //casper.log(resource, 'error')
});

casper.on('next.page', function(resource) {
  clickNextOrDie(this);
});

if (!casper.cli.has('username')) {
  casper.log("You need to specify a username!", "error");
  casper.exit(1);
}

casper.start('http://hypem.com/' + casper.cli.get('username') + "/", function() {
  clickNextOrDie(this);
});

casper.run(function() {
  casper.log(global_songs.length, 'error');
});