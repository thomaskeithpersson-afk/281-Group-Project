const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: { type: String, required: false }
});
const plugin = passportLocalMongoose.default || passportLocalMongoose;
userSchema.plugin(plugin);
module.exports = mongoose.model('User', userSchema);