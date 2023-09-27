const axios = require('axios');
const Redis = require("ioredis");
const redisClient = new Redis()

// Middleware to fetch news articles based on a preference
async function fetchNewsByPreference(req, res) { 
    try {
        const preference =req.params.key
        const apiKey = '9c17827e80914f66b64c18243d22435c'; // This should be stored safely in the secrets of github, and not exposed like this
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${preference}&apiKey=${apiKey}`;
        // Make an HTTP GET request to fetch news articles

        console.log('Fetching News API data from News Server')
        const response = await axios.get(newsApiUrl);

        // Check if the request was successful
        if (response.status === 200) {
            res.status(200).send({ articles: response.data.articles })
            
            redisClient.set(`${preference}`, JSON.stringify(response.data.articles) )

        } else {
            // Handle the error if the request fails
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch news articles from News API.',
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
