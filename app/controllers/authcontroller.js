const passport = require('passport');
const User = require('../models/userModel');
const getLoginPage = (req, res) => {
    res.render('login', { error: null });
};
const getSignupPage = (req, res) => {
    res.render('signup', { error: null });
};
const registerUser = async (req, res) => {
    try {
        const newUser = new User({ 
            username: req.body.username, 
            email: req.body.email 
        });
        await User.register(newUser, req.body.password);
        passport.authenticate('local')(req, res, () => {
            res.redirect('/');
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.render('signup', { 
            user: req.session, 
            error: "That username is already taken. Please try another one." 
        }); 
    }
};
const loginUser = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',     
        failureRedirect: '/login' 
    })(req, res, next);
};
const logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
};
module.exports = { 
    getLoginPage, 
    getSignupPage, 
    registerUser, 
    loginUser, 
    logoutUser 
};