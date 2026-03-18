const express = require('express');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const bookController = require('./controllers/bookController');
const authController = require('./controllers/authcontroller');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'book-exchange-ense-lab',
    resave: false,
    saveUninitialized: false
}));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });
app.use((req, res, next) => {
    res.locals.user = req.session;
    next();
});
app.get('/', bookController.getHomePage);
app.get('/login', authController.getLoginPage);
app.get('/signup', authController.getSignupPage);
app.post('/login', authController.handleLogin);
app.post('/signup', authController.handleSignup);
app.get('/logout', authController.logout);
app.post('/delete/:id', bookController.deleteListing);
app.post('/contact-seller/:id', bookController.handleContactSeller);
app.get('/search', bookController.getAdvancedSearchPage);
app.get('/my-listings', bookController.getUserListings);
app.get('/post', bookController.getPostPage);
app.post('/post', upload.single('image'), bookController.createListing);
app.get('/book/:id', bookController.getBookDetails);
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`BookExchange running on http://localhost:${PORT}`);
});