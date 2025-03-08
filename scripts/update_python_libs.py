import pip
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def install(package):
    pip.main(['install', package])

def upgrade(package):
    pip.main(['install', '--upgrade', package])

# Example
if __name__ == '__main__':
    upgrade('youtube-search-python')
    upgrade('yt-dlp')