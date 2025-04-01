document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filter-form');
    const searchButton = document.getElementById('search-button');
    const nextButton = document.getElementById('next-button');
    const resetButton = document.getElementById('reset-button');
    const movieResult = document.getElementById('movie-result');
    const noResults = document.getElementById('no-results');
    const loading = document.getElementById('loading');
    const filterSection = document.querySelector('.app-wrapper'); // Get the entire filter section

    // Language search elements
    const languageSearch = document.getElementById('language-search');
    const languageSuggestions = document.getElementById('language-suggestions');
    const languageInput = document.getElementById('language');
    const selectedLanguage = document.getElementById('selected-language');
    const languageName = document.getElementById('language-name');
    const clearLanguage = document.getElementById('clear-language');

    // Available languages map (name to code)
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

    // Current filters state
    let currentFilters = {};

    // Language search functionality
    languageSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();

        if (searchTerm.length < 2) {
            languageSuggestions.classList.add('hidden');
            return;
        }

        // Clear previous suggestions
        languageSuggestions.innerHTML = '';

        // Filter languages based on search term
        const filteredLanguages = Object.keys(languages).filter(lang =>
            lang.toLowerCase().includes(searchTerm)
        );

        if (filteredLanguages.length === 0) {
            languageSuggestions.classList.add('hidden');
            return;
        }

        // Create suggestion elements
        filteredLanguages.forEach(lang => {
            const suggestion = document.createElement('div');
            suggestion.className = 'language-suggestion';
            suggestion.textContent = lang;
            suggestion.dataset.code = languages[lang];

            suggestion.addEventListener('click', function() {
                // Set hidden input value
                languageInput.value = this.dataset.code;

                // Set visible selected language
                languageName.textContent = lang;
                selectedLanguage.classList.remove('hidden');

                // Clear and hide search input and suggestions
                languageSearch.value = '';
                languageSuggestions.classList.add('hidden');
                languageSearch.classList.add('hidden');
            });

            languageSuggestions.appendChild(suggestion);
        });

        // Show suggestions
        languageSuggestions.classList.remove('hidden');
    });

    // Handle clear language button
    clearLanguage.addEventListener('click', function() {
        // Clear language selection
        languageInput.value = '';
        selectedLanguage.classList.add('hidden');
        languageSearch.classList.remove('hidden');
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-search-container')) {
            languageSuggestions.classList.add('hidden');
        }
    });

    // Function to display a movie in the result section
    function displayMovie(movie) {
        // Hide loading and no results
        loading.classList.add('hidden');
        noResults.classList.add('hidden');

        // Hide filter section
        filterSection.classList.add('hidden');

        // Set movie details
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-year').textContent = movie.year;
        document.getElementById('movie-runtime').textContent = movie.runtime;
        document.getElementById('movie-rating').textContent = `${movie.rating}/10`;
        document.getElementById('movie-plot').textContent = movie.plot;
        document.getElementById('movie-director').textContent = movie.director;
        document.getElementById('movie-cast').textContent = movie.cast.join(', ');
        document.getElementById('movie-language').textContent = movie.language;

        // Set poster image with fallback
        const posterImg = document.getElementById('movie-poster-img');
        if (movie.poster) {
            posterImg.src = movie.poster;
            posterImg.alt = `${movie.title} poster`;
        } else {
            posterImg.src = '/static/placeholder.jpg';
            posterImg.alt = 'No poster available';
        }

        // Set genres
        const genresContainer = document.getElementById('movie-genres');
        genresContainer.innerHTML = '';
        movie.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'genre-tag';
            genreTag.textContent = genre;
            genresContainer.appendChild(genreTag);
        });

        // Show the result and enable next button
        movieResult.classList.remove('hidden');
        nextButton.disabled = false;
    }

    // Function to handle errors
    function handleError(message) {
        // Hide loading and movie result
        loading.classList.add('hidden');
        movieResult.classList.add('hidden');

        // Show error message
        noResults.classList.remove('hidden');
        noResults.querySelector('p').textContent = message;
        nextButton.disabled = true;
    }

    // Function to show loading state
    function showLoading() {
        movieResult.classList.add('hidden');
        noResults.classList.add('hidden');
        filterSection.classList.add('hidden'); // Hide filter section during loading
        loading.classList.remove('hidden');
        searchButton.disabled = true;
        nextButton.disabled = true;
    }

    // Function to reset loading state
    function resetLoadingState() {
        searchButton.disabled = false;
    }

    // Function to get a random movie
    function getRandomMovie(filters) {
        // Show loading state
        showLoading();

        // Store current filters for "Next" button
        currentFilters = filters;

        // Create form data
        const formData = new FormData();
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                formData.append(key, value);
            }
        }

        // Make API request
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
                filterSection.classList.remove('hidden'); // Show filter section again on error
            } else {
                displayMovie(data);
            }
        })
        .catch(error => {
            resetLoadingState();
            handleError('An error occurred. Please try again.');
            filterSection.classList.remove('hidden'); // Show filter section again on error
            console.error('Error:', error);
        });
    }

    // Event listener for filter form submission
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(filterForm);
        const filters = Object.fromEntries(formData.entries());

        // Get a random movie
        getRandomMovie(filters);
    });

    // Event listener for Next button
    nextButton.addEventListener('click', function() {
        getRandomMovie(currentFilters);
    });

    // Event listener for Reset button
    resetButton.addEventListener('click', function() {
        // Reset form
        filterForm.reset();

        // Clear language selection UI
        languageInput.value = '';
        selectedLanguage.classList.add('hidden');
        languageSearch.classList.remove('hidden');

        // Clear results
        movieResult.classList.add('hidden');
        noResults.classList.add('hidden');
        loading.classList.add('hidden');

        // Show filter section
        filterSection.classList.remove('hidden');

        nextButton.disabled = true;
        searchButton.disabled = false;
        
        // Clear current filters
        currentFilters = {};
    });
});