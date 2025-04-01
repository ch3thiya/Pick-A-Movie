import requests

api_key = "bb595a55c6ceab254c5518cc73cc288a"
url = f"https://api.themoviedb.org/3/configuration/languages?api_key={api_key}"

response = requests.get(url)
languages = response.json()

print(languages)
