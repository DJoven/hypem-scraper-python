import requests
import simplejson as json

BASE_URI = "http://hypem.com"


class Song:
    def __init__(self, title, artist):
        self.title = title
        self.artist = artist

    def __repr__(self):
        return str("<%s - %s>" % (self.title, self.artist))

    def get_fullname(self):
        return "%s %s" % (self.title, self.artist)


def clean(string):
    return string.encode('ascii', 'ignore')


def get_all_songs(username):
    has_songs = True;
    count = 1
    songs = []

    while True:
        print "%s/playlist/loved/%s/json/%s/data.js" % (BASE_URI, username, count)
        r = requests.get("%s/playlist/loved/%s/json/%s/data.js" % (BASE_URI, username, count))

        if not r.ok:
            if r.status_code == 400:
                break
            else:
                print r
                break

        data = json.loads(r.text)

        num = 0;
        while True:
            if not str(num) in data:
                break

            song = Song(clean(data[str(num)]['title']), clean(data[str(num)]['artist']))
            songs.append(song)
            num = num + 1

        count = count + 1

    return songs


def download_mp3(song):
    query = {'q[fulltext]': song.get_fullname()}
    resp = requests.get('http://soundcloud.com/search', params=query)
    start = resp.text.find('streamUrl')
    end = resp.text.find(',', start)
    startm = start + 12
    endm = end - 1
    url = resp.text[startm:endm]

    r = requests.get(url)
    filename = song.get_fullname()
    f = open(filename + '.mp3', 'w')
    f.write(r.content)
    f.close()
