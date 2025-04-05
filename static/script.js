document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filter-form');
    const searchButton = document.getElementById('search-button');
    const nextButton = document.getElementById('next-button');
    const resetButton = document.getElementById('reset-button');
    const movieResult = document.getElementById('movie-result');
    const noResults = document.getElementById('no-results');
    const loading = document.getElementById('loading');
    const filterSection = document.querySelector('.app-wrapper'); 

    const languageSearch = document.getElementById('language-search');
    const languageSuggestions = document.getElementById('language-suggestions');
    const languageInput = document.getElementById('language');
    const selectedLanguage = document.getElementById('selected-language');
    const languageName = document.getElementById('language-name');
    const clearLanguage = document.getElementById('clear-language');

    const languages = {
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
        "Shanghainese": "zh",
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
    };

    let currentFilters = {};

    languageSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();

        if (searchTerm.length < 2) {
            languageSuggestions.classList.add('hidden');
            return;
        }

        languageSuggestions.innerHTML = '';

        const filteredLanguages = Object.keys(languages).filter(lang =>
            lang.toLowerCase().includes(searchTerm)
        );

        if (filteredLanguages.length === 0) {
            languageSuggestions.classList.add('hidden');
            return;
        }

        filteredLanguages.forEach(lang => {
            const suggestion = document.createElement('div');
            suggestion.className = 'language-suggestion';
            suggestion.textContent = lang;
            suggestion.dataset.code = languages[lang];

            suggestion.addEventListener('click', function() {
                languageInput.value = this.dataset.code;

                languageName.textContent = lang;
                selectedLanguage.classList.remove('hidden');

                languageSearch.value = '';
                languageSuggestions.classList.add('hidden');
                languageSearch.classList.add('hidden');
            });

            languageSuggestions.appendChild(suggestion);
        });

        languageSuggestions.classList.remove('hidden');
    });

    clearLanguage.addEventListener('click', function() {
        languageInput.value = '';
        selectedLanguage.classList.add('hidden');
        languageSearch.classList.remove('hidden');
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-search-container')) {
            languageSuggestions.classList.add('hidden');
        }
    });

    function displayMovie(movie) {
        loading.classList.add('hidden');
        noResults.classList.add('hidden');

        filterSection.classList.add('hidden');

        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-year').textContent = movie.year;
        document.getElementById('movie-runtime').textContent = movie.runtime;
        document.getElementById('movie-rating').textContent = `${movie.rating}/10`;
        document.getElementById('movie-plot').textContent = movie.plot;
        document.getElementById('movie-director').textContent = movie.director;
        document.getElementById('movie-cast').textContent = movie.cast.join(', ');
        document.getElementById('movie-language').textContent = movie.language;

        const posterImg = document.getElementById('movie-poster-img');
        if (movie.poster) {
            posterImg.src = movie.poster;
            posterImg.alt = `${movie.title} poster`;
        } else {
            posterImg.src = '/static/placeholder.jpg';
            posterImg.alt = 'No poster available';
        }

        const genresContainer = document.getElementById('movie-genres');
        genresContainer.innerHTML = '';
        movie.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'genre-tag';
            genreTag.textContent = genre;
            genresContainer.appendChild(genreTag);
        });

        movieResult.classList.remove('hidden');
        nextButton.disabled = false;
    }

    function handleError(message) {
        loading.classList.add('hidden');
        movieResult.classList.add('hidden');

        noResults.classList.remove('hidden');
        noResults.querySelector('p').textContent = message;
        nextButton.disabled = true;
    }

    function showLoading() {
        movieResult.classList.add('hidden');
        noResults.classList.add('hidden');
        filterSection.classList.add('hidden');
        loading.classList.remove('hidden');
        searchButton.disabled = true;
        nextButton.disabled = true;
    }

    function resetLoadingState() {
        searchButton.disabled = false;
    }

    function getRandomMovie(filters) {
        showLoading();

        currentFilters = filters;

        const formData = new FormData();
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                formData.append(key, value);
            }
        }

        fetch('/get_random_movie', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            resetLoadingState();
            if (data.error) {
                handleError(data.error);
                filterSection.classList.remove('hidden');
            } else {
                displayMovie(data);
            }
        })
        .catch(error => {
            resetLoadingState();
            handleError('An error occurred. Please try again.');
            filterSection.classList.remove('hidden');
            console.error('Error:', error);
        });
    }

    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(filterForm);
        const filters = Object.fromEntries(formData.entries());

        getRandomMovie(filters);
    });

    nextButton.addEventListener('click', function() {
        getRandomMovie(currentFilters);
    });

    resetButton.addEventListener('click', function() {
        filterForm.reset();

        languageInput.value = '';
        selectedLanguage.classList.add('hidden');
        languageSearch.classList.remove('hidden');

        movieResult.classList.add('hidden');
        noResults.classList.add('hidden');
        loading.classList.add('hidden');

        filterSection.classList.remove('hidden');

        nextButton.disabled = true;
        searchButton.disabled = false;
        
        currentFilters = {};
    });
});
