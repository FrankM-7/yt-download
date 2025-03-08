import pip

def install(package):
    pip.main(['install', package])

def upgrade(package):
    pip.main(['install', '--upgrade', package])

# Example
if __name__ == '__main__':
    upgrade('youtube-search-python')