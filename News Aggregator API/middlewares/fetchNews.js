const axios = require('axios');

// Middleware to fetch news articles based on a preference
async function fetchNewsByPreference(req, res) { 
    try {
        const apiKey = '9c17827e80914f66b64c18243d22435c'; // This should be stored safely in the secrets of github, and not exposed like this
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${req.preference}&apiKey=${apiKey}`;
        // Make an HTTP GET request to fetch news articles
        const response = await axios.get(newsApiUrl);

        // Check if the request was successful
        if (response.status === 200) {
            res.status(200).send({ articles: response.data.articles })

        } else {
            // Handle the error if the request fails
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch news articles.',
            });
        }
    } catch (error) {
        // Handle any unexpected errors
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
}

module.exports = { fetchNewsByPreference };
