const Book = require('../models/bookModel');
const nodemailer = require('nodemailer');
const getHomePage = async (req, res) => {
    try {
        const books = await Book.find().sort({ DateAdded: -1 });
        res.render('index', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error.");
    }
};
const getAdvancedSearchPage = async (req, res) => {
    const hasSearched = Object.keys(req.query).length > 0;
    let searchResults = [];
    if (hasSearched) {
        let query = {};
        
        if (req.query.q) {
            query.title = { $regex: req.query.q, $options: 'i' }; 
        }
        if (req.query.department) query.department = req.query.department;
        if (req.query.course) query.courseNumber = { $regex: req.query.course, $options: 'i' };
        if (req.query.condition) query.condition = req.query.condition;
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        try {
            searchResults = await Book.find(query).sort({ DateAdded: -1 });
        } catch (error) {
            console.error("Search error:", error);
        }
    }
    res.render('search', { 
        books: searchResults, 
        hasSearched: hasSearched,
        searchParams: req.query 
    });
};
const getUserListings = async (req, res) => {
    if (!req.user) return res.redirect('/login'); 

    try {
        const books = await Book.find({ sellerId: req.user._id });
        res.render('my-listings', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error.");
    }
};
const getPostPage = (req, res) => {
    if (!req.user) return res.redirect('/login'); 
    res.render('post');
};
const createListing = async (req, res) => {
    if (!req.user) return res.redirect('/login');
    
    const { title, department, courseNumber, price, condition, contact, notes } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-placeholder.jpg';
    
    try {
        const newBook = new Book({
            title,
            department,
            courseNumber,
            price: parseFloat(price),
            condition,
            imageUrl,
            sellerId: req.user._id,
            sellerName: req.user.username,
            contact: contact, 
            notes
        });
        await newBook.save(); 
        res.redirect('/');
    } catch (error) {
        console.error("Error saving book:", error);
        res.status(500).send("Error saving your listing.");
    }
};
const getBookDetails = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send('Book not found');
        res.render('details', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send("Invalid Book ID.");
    }
};
const deleteListing = async (req, res) => {
    if (!req.user) return res.redirect('/login');
    try {
        await Book.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
        res.redirect('/my-listings');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting book.");
    }
};
const handleContactSeller = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || !book.contact) {
            return res.status(404).send("Seller contact information not found.");
        }
        if (!book.contact.includes('@')) {
            console.error("Attempted to send email to invalid address:", book.contact);
            return res.status(400).send("The seller did not provide a valid email address. Cannot send message.");
        }
        if (!book || !book.contact) {
            return res.status(404).send("Seller contact information not found.");
        }
        const { buyerName, buyerEmail, message } = req.body;
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'tandiajames10@gmail.com', 
                pass: 'bbmqmkmoxpvkodtb'     
            }
        });
        const mailOptions = {
            from: 'BookExchange Notifications <tandiajames10@gmail.com>',
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
        await transporter.sendMail(mailOptions);
        res.redirect('/success'); 
    } catch (error) {
        console.error("Email failed to send:", error);
        res.status(500).send("There was an error sending your message. Please try again.");
    }
};
const getSuccessPage = (req, res) => {
    res.render('success');
};

module.exports = { 
    getHomePage, 
    getAdvancedSearchPage, 
    getUserListings, 
    getPostPage, 
    createListing, 
    getBookDetails, 
    deleteListing, 
    handleContactSeller, 
    getSuccessPage 
};