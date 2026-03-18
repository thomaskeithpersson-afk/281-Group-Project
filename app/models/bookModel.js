const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/books.json');

const getBooks = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};
const saveBooks = (books) => {
    fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
};
const searchBooks = (queryFilters) => {
    const allBooks = getBooks();
    
    return allBooks.filter(book => {
        let match = true;
        // 1. Keyword Search (Title, Authors, etc.)
        if (queryFilters.q && queryFilters.q.trim() !== '') {
            match = match && book.title.toLowerCase().includes(queryFilters.q.toLowerCase());
        }
        
        // 2. Department Dropdown
        if (queryFilters.department && queryFilters.department.trim() !== '') {
            match = match && book.department.toLowerCase() === queryFilters.department.toLowerCase();
        }

        // 3. Course Code Search
        if (queryFilters.course && queryFilters.course.trim() !== '') {
            match = match && book.courseNumber.toLowerCase().includes(queryFilters.course.toLowerCase());
        }

        // 4. Condition Dropdown
        if (queryFilters.condition && queryFilters.condition.trim() !== '') {
            match = match && book.condition.toLowerCase() === queryFilters.condition.toLowerCase();
        }

        // 5. Minimum Price
        if (queryFilters.minPrice && queryFilters.minPrice.trim() !== '') {
            match = match && book.price >= parseFloat(queryFilters.minPrice);
        }

        // 6. Maximum Price
        if (queryFilters.maxPrice && queryFilters.maxPrice.trim() !== '') {
            match = match && book.price <= parseFloat(queryFilters.maxPrice);
        }

        return match;
    });
};
const getBooksByUser = (userId) => {
    const allBooks = getBooks();
    return allBooks.filter(b => b.sellerId === userId);
};
const createListing = (title, dept, course, price, condition, imageUrl, sellerId, sellerName, contact, notes) => {
    const books = getBooks();
    const newBook = {
        id: uuidv4(),
        title: title, 
        department: dept, 
        courseNumber: course,
        price: price, 
        condition: condition, 
        imageUrl: imageUrl, 
        sellerId: sellerId,
        sellerName: sellerName,
        contact: contact,
        notes: notes
    };
    books.push(newBook);
    saveBooks(books);
    return newBook;
};

module.exports = { getBooks, searchBooks, getBooksByUser, createListing };
const getBookById = (id) => {
    const books = getBooks();
    return books.find(book => book.id === id);
};
const deleteBook = (bookId, userId) => {
    let books = getBooks();
    const initialLength = books.length;
    books = books.filter(book => !(book.id === bookId && book.sellerId === userId));
    if (books.length < initialLength) {
        saveBooks(books);
        return true;
    }
    return false;
};
module.exports = { getBooks, searchBooks, getBooksByUser, createListing, getBookById, deleteBook };