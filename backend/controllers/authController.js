const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const errors = {};

    if (!name || !name.trim()) errors.name = 'Name is required';
    if (!email || !email.trim() || !emailRegex.test(email.trim()))
        errors.email = 'Enter a valid email address';
    if (!password || password.length < 8)
        errors.password = 'Password must be at least 8 characters long';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    try {
        const userExists = await User.findOne({
            email: email.trim().toLowerCase(),
        });
        if (userExists)
            return res
                .status(400)
                .json({ message: 'An account with this email already exists' });

        const user = await User.create({ name: name.trim(), email, password });
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
