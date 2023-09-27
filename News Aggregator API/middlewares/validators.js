const { check } = require('express-validator');

// Validation middleware to check if req.body contains email and password
function validateRegistration(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            status: 'fail',
            message: 'Both email and password are required!',
        });
    }
    next();
}

// Middleware to check if email is already taken
function checkEmailTaken(users) {
    return (req, res, next) => {
        const isEmailTaken = users.some(user => user.email === req.body.email);
        if (isEmailTaken) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email Taken!',
            });
        }
        next();
    };
}

// Middleware to check if the request has an email parameter
function checkEmailParam(req, res, next) {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({
            status: 'fail',
            message: 'Email parameter is required in the request',
        });
    }
    next();
}
// Helper function to retrieve news preferences for a user or return an error
function getNewsPreferences(email, users) {
    // Find the user by email in the users array
    const user = users.find(user => user.email === email);

    if (!user) {
        // User not found, return an error response
        return {
            status: 'fail',
            message: 'User not found',
        };
    }

    if (!user.preferences || user.preferences.length === 0) {
        // User has no preferences, return an error response
        return {
            status: 'fail',
            message: 'User has no news preferences',
        };
    }

    // If the user is found and has preferences, return their preferences
    return {
        status: 'success',
        data: {
            preferences: user.preferences,
        },
    };
}

// Middleware to check if the request has an email parameter
function checkEmailExists(req, res, next) {
    const { email } = req.query;

    // Check if the email is present in the users array
    const userExists = users.some(user => user.email === email);

    if (!userExists) {
        // User not found, return an error response with proper status and message
        return res.status(404).json({
            status: 'fail',
            message: 'User not found',
        });
    }

    // User exists, allow the execution to proceed to the next middleware or route handler
    next();
}

// Define validation checks as middleware functions
const registrationValidation = [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 }),
];


module.exports = { validateRegistration, checkEmailTaken, checkEmailParam, getNewsPreferences, checkEmailExists, registrationValidation };
