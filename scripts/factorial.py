import sys
from youtubesearchpython import VideosSearch

query = "sys.argv[1]"

print("Query: ", query)

output_json = {}
output_json["results"] = []

# init VideosSearch object
videosSearch = VideosSearch(query, limit = 10)
results = videosSearch.result()["result"]
# build the url
youtube_link = "https://www.youtube.com/watch?v="
for result in results:
	newlink = youtube_link + result["id"]

	newResult = {}
	newResult["title"] = result["title"]
	newResult["link"] = newlink
	newResult["videos"] = []
	# get thumbnail with the highest resolution
	newResult["thumbnail"] = result["thumbnails"][0]["url"]
	newResult["duration"] = result["duration"]

	output_json["results"].append(newResult)
	
print(output_json)