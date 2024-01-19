const User = require('../model/userModel');
const bcrypt = require('bcrypt');

const adminEmail = 'admin@gmail.com';
const adminPassword = 'adminkp';

const verifyAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Received login request:', email);

        if (email === adminEmail && password === adminPassword) {
            // Successful admin login
            req.session.admin = { email: adminEmail };
            console.log('Successful admin login');
            res.redirect('/adminHome');
        } else {
            // Incorrect admin credentials
            console.log('Incorrect admin credentials');
            res.redirect('/admin/login'); 
        }
    } catch (error) {
        console.log('Login failed');
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
};

const renderAdminHome = async (req, res) => {
    if (req.session.admin) {
        try {
            let query = {}; 

            // Check if a search term is provided
            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search, 'i');
                query = {
                    $or: [
                        { name: searchRegex },
                        { email: searchRegex },
                        
                    ],
                };
            }
            const users = await User.find(query);
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('adminHome', { admin: req.session.admin, users: users });
        } catch (error) {
            console.error('Error fetching users:', error.message);
            res.status(500).json({ error: 'Error fetching users.' });
        }
    } else {
        res.redirect('/admin/login');
    }
};

// Render the user edit page
const renderEditUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('editUser', { user });
    } catch (error) {
        console.error('Error rendering edit page:', error);
        res.status(500).send('Internal Server Error');
    }
};

const editUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { name, email, } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { name, email }, { new: true });

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        res.redirect('/adminHome'); 
    } catch (error) {
        console.error('Error editing user:', error);
        res.status(500).send('Internal Server Error');
    }
};



const toggleBlockUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Toggle the isBlocked field
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.isBlocked = !user.isBlocked;
        await user.save();

        res.redirect('/adminHome'); 
    } catch (error) {
        console.error('Error toggling user block:', error);
        res.status(500).send('Internal Server Error');
    }
};

const renderCreateUser = (req, res) => {
    res.render('createUser');
};
const addUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user instance with the hashed password
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        // Save the new user to the database
        await newUser.save();
  
        res.redirect('/adminHome');
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send('Internal Server Error');
    }
};

const logoutAdmin = (req, res) => {
    // Destroy the admin session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during admin logout:', err);
            res.status(500).json({ error: 'Logout failed. Please try again later.' });
        } else {
    
            res.redirect('/admin/login');
        }
    });
};

module.exports = { 
    verifyAdmin,
    renderAdminHome,
    renderEditUser,
    editUser,
    toggleBlockUser,
    renderCreateUser,
    addUser,
    logoutAdmin,
};