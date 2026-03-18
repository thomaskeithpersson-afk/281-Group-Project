const User = require('../models/userModel');

const getLoginPage = (req, res) => {
    res.render('login', { error: null });
};

const getSignupPage = (req, res) => {
    res.render('signup', { error: null });
};

const handleLogin = (req, res) => {
    const { username, password } = req.body;
    if (User.checkPassword(username, password)) {
        const user = User.findUserByUsername(username);
        req.session.userId = user.id; // Store user ID in session
        req.session.username = user.username;
        return res.redirect('/'); // Redirect to home page
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
};

const handleSignup = (req, res) => {
    const { username, password } = req.body;
    const user = User.createUser(username, password);
    if (user) {
        req.session.userId = user.id; // Store user ID in session
        req.session.username = user.username;
        res.redirect('/');
    } else {
        res.render('signup', { error: 'Username is already taken' });
    }
};

const logout = (req, res) => {
    req.session.destroy(); // Destroy the session
    res.redirect('/login');
};

module.exports = { getLoginPage, getSignupPage, handleLogin, handleSignup, logout };