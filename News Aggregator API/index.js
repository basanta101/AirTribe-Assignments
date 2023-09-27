const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const morgan = require('morgan')
// Import the authentication middleware
const auth = require('./middlewares/authenticate');

// Import custom middlewares for validation and checks
const {
    checkEmailTaken,
    getNewsPreferences,
    checkEmailParam,
    checkEmailExists,
    registrationValidation
} = require('./middlewares/validators');

const { errorHandler } = require('./middlewares/errorHandler');
const { fetchNewsByPreference } = require('./middlewares/fetchNews')
const {cacheData} = require('./middlewares/cache')

// Create an array to store user data
const users = [];

// Create an Express application
const app = express();
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));


let rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100,
    message: {
        error: {
            code: 429,
            message: "Too Many Requests",
            description: "We're sorry, but you have exceeded the maximum number of requests allowed. Please try again later."
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(rateLimiter);

// Define the POST route for user registration
// POST /register: Register a new user with input validation
app.post('/register',
    registrationValidation,
    checkEmailTaken(users),
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation error',
                errors: errors.array(),
            });
        }

        try {
            const { email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = { email, password: hashedPassword };
            users.push(user);

            res.status(201).json({
                status: 'success',
                message: 'User Registered!',
                data: {
                    user: {
                        email: user.email,
                    },
                },
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
            });
        }
    });
// Define the POST route for user login
app.post('/login', async (req, res) => {
    try {
        const user = users.find(user => user.email === req.body.email);
        if (!user) {
            // User not found, return an error response
            const err = new Error('User Not Found!')
            err.status = 400;
            throw err;
        } else if (await bcrypt.compare(req.body.password, user.password)) {
            // Password matches, create and send an access token
            const tokenPayload = {
                email: user.email,
            };
            const accessToken = jwt.sign(tokenPayload, 'SECRET');
            res.status(201).json({
                status: 'success',
                message: 'User Logged In!',
                data: {
                    accessToken,
                },
            });
        } else {
            // Password is incorrect, return an error response
            const err = new Error('Wrong Password!');
            err.status = 400;
            throw err;
        }
    } catch (err) {
        // Handle errors and respond with an error message
        res.status(err.status).json({
            status: 'fail',
            message: err.message,
        });
    }
});

// Middleware to protect routes below this point using authentication
app.use(auth);

// Define the PUT route to update user preferences
app.put('/preferences', checkEmailParam, checkEmailExists(users), (req, res) => {
    const { email } = req.query;

    const updatedPreferences = req.body.preferences;

    if (!updatedPreferences) {
        // Preferences are missing in the request, return an error response
        return res.status(400).json({
            status: 'fail',
            message: 'Preferences are required in the request body',
        });
    }

    // Update the preferences for the user (replace with your logic)
    const userIndex = users.findIndex(user => user.email === email);
    users[userIndex].preferences = updatedPreferences;

    // Respond with a success message and updated preferences
    res.status(200).json({
        status: 'success',
        message: 'News preferences updated successfully',
        data: {
            preferences: updatedPreferences,
        },
    });
});

// Define the GET route to retrieve user preferences
app.get('/preferences', checkEmailParam, (req, res) => {
    // Access the email from the request parameters
    const { email } = req.query;

    // Check if the email is present in the users array
    const userExists = users.some(user => user.email === email);

    if (!userExists) {
        // User not found, return an error response
        return res.status(404).json({
            status: 'fail',
            message: 'User not found',
        });
    }

    // Retrieve and return news preferences for the user using the updated function
    const result = getNewsPreferences(email, users);

    if (result.status === 'success') {
        // User found, return preferences with a success status
        res.status(200).json(result);
    } else {
        // Preferences not found (or other error), return an error response
        res.status(404).json(result);
    }
});

app.get('/news', async (req, res, next) => {
    debugger

    try {
        // Access the authenticated user's email from the request
        const { email } = req.user;

        // Get the user's news preferences
        const userPreferences = await getNewsPreferences(email, users);

        if (userPreferences.status === 'fail') {
            // Handle the case where preferences are not found or an error occurs
            return res.status(404).json("unable to retrieve user preferences");
        }

        // Fetch news articles based on the user's preferences
        req.params.key = userPreferences.data.preferences
        next()

    } catch (error) {
    debugger

        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
}, cacheData, fetchNewsByPreference);

app.use(errorHandler)



// Start the Express server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});


// https://adevait.com/nodejs/how-to-implement-jwt-authentication-on-node

// Redis Cache: https://www.digitalocean.com/community/tutorials/how-to-implement-caching-in-node-js-using-redis

// https://medium.com/@techsuneel99/mastering-node-js-security-your-roadmap-to-robust-application-protection-816c0acc26ce
