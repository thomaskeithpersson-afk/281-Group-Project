require('dotenv').config();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bookController = require('./controllers/bookController');
const authController = require('./controllers/authController');
const User = require('./models/userModel');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB!"))
    .catch((err) => console.error("MongoDB connection error:", err));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.user = req.user ? { userId: req.user._id, username: req.user.username } : null;
    next();
});
app.get('/', bookController.getHomePage);
app.get('/login', authController.getLoginPage);
app.get('/signup', authController.getSignupPage);
app.post('/login', authController.loginUser);
app.post('/signup', authController.registerUser);
app.get('/logout', authController.logoutUser);
app.post('/delete/:id', bookController.deleteListing);
app.post('/contact-seller/:id', bookController.handleContactSeller);
app.get('/search', bookController.getAdvancedSearchPage);
app.get('/my-listings', bookController.getUserListings);
app.get('/post', bookController.getPostPage);
app.post('/post', upload.single('image'), bookController.createListing);
app.get('/book/:id', bookController.getBookDetails);
app.get('/success', bookController.getSuccessPage);
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`BookExchange running on http://localhost:${PORT}`);
});