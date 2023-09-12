const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'natoursAmazingWorldwideTours';

async function register(email, password) {
    // on register - looking to find inside the database if the user exists
    const existingUser = await User.findOne({ email }).collation({ locale:'en', strength: 2 });
    // if user exists - throw error telling the user that the email is already taken
    if(existingUser) {
        throw new Error('Email is already taken');
    }
    // if user does not exists 
    // - hashing his password
    const hashedPass = await bcrypt.hash(password, 10);
    // - saving his data to the database, returning user data to create a token
    const user = await User.create({ email, hashedPass });
    // - creating user token from the saved data
    return {
        _id: user._id,
        email: user.email,
        accessToken: createToken(user)
    };
}

async function login(email, password) {
    // on login - looking to find inside the database the user's cridentials
    const user = await User.findOne({ email }).collation({ locale:'en', strength: 2 });
    // if user's credentials is wrong(email)' - throw error telling the user that email or pass are wrong
    if(!user) {
        throw new Error('Email or password does not exists')
    }
    // comparing the user entered password with the hashedPass inside the database to see if they match
    const hashMached = await bcrypt.compare(password, user.hashedPass);
    // if password does not match with the hashedPass - throwing error 
    if(hashMached == false) {
        throw new Error('Email or password does not exists');
    }
    // if match - return token
    return {
        _id: user._id,
        email: user.email,
        accessToken: createToken(user)
    };
}

function logout() {}


function createToken(userData) {
    // inside the payload we enter the id and email of the user
    const payload = {
        _id: userData._id,
        email: userData.email
    };
    // creating a token with the payload info + secret words
    const token = jwt.sign(payload, JWT_SECRET);
    // returning the token
    return token;
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    register,
    login,
    logout,
    verifyToken
}