from flask import Flask, render_template, request, jsonify
import requests
import random
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = "https://api.themoviedb.org/3"

LANGUAGE_CODES = {
    "English": "en",
    "Mandarin Chinese": "zh",
    "Hindi": "hi",
    "Spanish": "es",
    "French": "fr",
    "Arabic": "ar",
    "Bengali": "bn",
    "Russian": "ru",
    "Portuguese": "pt",
    "Indonesian": "id",
    "German": "de",
    "Japanese": "ja",
    "Telugu": "te",
    "Turkish": "tr",
    "Tamil": "ta",
    "Cantonese": "zh",
    "Korean": "ko",
    "Vietnamese": "vi",
    "Italian": "it",
    "Gujarati": "gu",
    "Polish": "pl",
    "Ukrainian": "uk",
    "Persian": "fa",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Thai": "th",
    "Dutch": "nl",
    "Romanian": "ro",
    "Czech": "cs",
    "Greek": "el"
}

def get_language_name(code):
    for name, lang_code in LANGUAGE_CODES.items():
        if lang_code == code:
            return name
    return "Unknown"

def get_genres():
    url = f"{TMDB_BASE_URL}/genre/movie/list"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()["genres"]
    return []

def discover_movies(filters):
    url = f"{TMDB_BASE_URL}/discover/movie"

    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "page": 1
    }

    if filters.get('genre'):
        params["with_genres"] = filters['genre']

    if filters.get('year_min') and filters.get('year_max'):
        params["primary_release_date.gte"] = f"{filters['year_min']}-01-01"
        params["primary_release_date.lte"] = f"{filters['year_max']}-12-31"

    if filters.get('rating_min'):
        params["vote_average.gte"] = filters['rating_min']

    if filters.get('language'):
        params["with_original_language"] = filters['language']

    response = requests.get(url, params=params)

    if response.status_code == 200:
        movies = response.json()["results"]
        return movies
    return []


def get_movie_details(movie_id):
    url = f"{TMDB_BASE_URL}/movie/{movie_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "append_to_response": "credits"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json()
    return None


@app.route('/')
def index():
    genres = get_genres()

    min_year = 1950
    max_year = 2025

    return render_template('index.html',
                           genres=genres,
                           min_year=min_year,
                           max_year=max_year)


@app.route('/get_random_movie', methods=['POST'])
def get_random_movie():
    filters = {
        'genre': request.form.get('genre'),
        'year_min': request.form.get('year_min'),
        'year_max': request.form.get('year_max'),
        'rating_min': request.form.get('rating_min'),
        'language': request.form.get('language')
    }

    filters = {k: v for k, v in filters.items() if v}

    movies = discover_movies(filters)

    if not movies:
        return jsonify({'error': 'No movies match your filters. Try adjusting your criteria.'})

    random_movie = random.choice(movies)

    movie_details = get_movie_details(random_movie["id"])

    if not movie_details:
        return jsonify({'error': 'Failed to load movie details. Please try again.'})

    formatted_movie = {
        'id': movie_details['id'],
        'title': movie_details['title'],
        'year': movie_details['release_date'][:4] if movie_details.get('release_date') else 'Unknown',
        'rating': movie_details['vote_average'],
        'genres': [genre['name'] for genre in movie_details['genres']],
        'director': next((crew['name'] for crew in movie_details.get('credits', {}).get('crew', [])
                          if crew['job'] == 'Director'), 'Unknown'),
        'cast': [cast['name'] for cast in movie_details.get('credits', {}).get('cast', [])[:5]],
        'plot': movie_details.get('overview', 'No plot available.'),
        'runtime': f"{movie_details.get('runtime', 0)} min",
        'language': get_language_name(movie_details.get('original_language', 'en')),
        'poster': f"https://image.tmdb.org/t/p/w500{movie_details['poster_path']}" if movie_details.get(
            'poster_path') else None
    }

    return jsonify(formatted_movie)


if __name__ == '__main__':
    app.run(debug=True)
