const axios = require('axios');

// Middleware to fetch news articles based on a preference
function fetchNewsByPreference(preference) {
    return async (req, res, next) => {
        try {
            const apiKey = 'YOUR_API_KEY'; // Replace with your NewsAPI key
            const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${preference}&apiKey=${apiKey}`;

            // Make an HTTP GET request to fetch news articles
            const response = await axios.get(newsApiUrl);

            // Check if the request was successful
            if (response.status === 200) {
                req.newsArticles = response.data.articles;
                next();
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
    };
}

module.exports = fetchNewsByPreference;
