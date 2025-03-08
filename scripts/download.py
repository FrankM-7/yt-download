import os
import sys
import io
import yt_dlp

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

link = sys.argv[1]
# output to desktop
# get user desktop path
desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
ydl_opts = {
    'outtmpl': desktop + '/Musica' +  '/%(title)s.%(ext)s',
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download([link])

type = "DOWNLOAD_RESULT"
print('{"type": "' + type + '", "data": "Downloaded to desktop"}')
