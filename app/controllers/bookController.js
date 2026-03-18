const Book = require('../models/bookModel');
const path = require('path');
const nodemailer = require('nodemailer');
const getHomePage = (req, res) => {
    const books = Book.getBooks();
    books.sort((a, b) => b.DateAdded - a.DateAdded);
    res.render('index', { books, user: req.session });
};
const getAdvancedSearchPage = (req, res) => {
    const query = req.query; 
    const books = Book.searchBooks(query);
    res.render('search', { books, searchParams: query, user: req.session });
};
const getUserListings = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const books = Book.getBooksByUser(req.session.userId);
    res.render('my-listings', { books, user: req.session });
};
const getPostPage = (req, res) => {
    if (!req.session.userId) return res.redirect('/login'); 
    res.render('post', { user: req.session });
};

const createListing = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const { title, department, courseNumber, price, condition, sellerName, contact, notes } = req.body;
    
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-placeholder.jpg';
    Book.createListing(
        title, department, courseNumber, parseFloat(price), 
        condition, imageUrl, req.session.userId, 
        sellerName, contact, notes
    );
    
    res.redirect('/');
};

module.exports = { getHomePage, getAdvancedSearchPage, getUserListings, getPostPage, createListing };
const getBookDetails = (req, res) => {
    const bookId = req.params.id;
    const book = Book.getBookById(bookId);
    
    if (!book) {
        return res.status(404).send('Book not found');
    }
    
    res.render('details', { book, user: req.session });
};
const deleteListing = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const bookId = req.params.id;
    Book.deleteBook(bookId, req.session.userId);
    res.redirect('/my-listings');
};
const handleContactSeller = async (req, res) => {
    const bookId = req.params.id;
    const { buyerName, buyerEmail, message } = req.body;
    const book = Book.getBookById(bookId);
    
    if (!book || !book.contact) {
        return res.status(404).send("Seller contact information not found.");
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: 'YOUR_EMAIL@gmail.com', 
            pass: 'YOUR_APP_PASSWORD'     
        }
    });
    const mailOptions = {
        from: 'BookExchange Notifications <YOUR_EMAIL@gmail.com>',
        to: book.contact,
        replyTo: buyerEmail, 
        subject: `BookExchange: Someone wants to buy "${book.title}"!`,
        text: `
Hello ${book.sellerName},

Good news! Another student is interested in buying your textbook: ${book.title}.

Buyer Name: ${buyerName}
Buyer Email: ${buyerEmail}

Message from Buyer:
"${message}"

To reply to the buyer and arrange the exchange, simply reply directly to this email!

- The BookExchange Team
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        res.redirect('/'); 
    } catch (error) {
        console.error("Email failed to send:", error);
        res.status(500).send("There was an error sending your message. Please try again.");
    }
};
module.exports = { getHomePage, getAdvancedSearchPage, getUserListings, getPostPage, createListing, getBookDetails, deleteListing, handleContactSeller };
