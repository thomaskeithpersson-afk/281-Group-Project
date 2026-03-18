const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dataPath = path.join(__dirname, '../data/users.json');
const getUsers = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};;
const saveUsers = (users) => {
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};
const findUserByUsername = (username) => {
    const users = getUsers();
    return users.find(u => u.username === username);
};
const createUser = (username, password) => {
    if (findUserByUsername(username)) return null; 
    const users = getUsers();
    const newUser = {
        id: uuidv4(),
        username: username,
        password: password
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
};
const checkPassword = (username, password) => {
    const user = findUserByUsername(username);
    if (!user) return false;
    return user.password === password; 
};
module.exports = { findUserByUsername, createUser, checkPassword };