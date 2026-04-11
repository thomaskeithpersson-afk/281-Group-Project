const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    courseNumber: { type: String, required: true },
    price: { type: Number, required: true },
    condition: { type: String, required: true },
    imageUrl: { type: String, default: '/uploads/default-placeholder.jpg' },
    sellerId: { type: String, required: true },
    sellerName: { type: String, required: true },
    contact: { type: String, required: true },
    notes: { type: String, default: 'No additional notes provided.' },
    
    DateAdded: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Book', bookSchema);