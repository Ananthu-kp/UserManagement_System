const User = require('../model/userModel');
const bcrypt = require('bcrypt');

const renderLoginPage = (req, res) => {
    if(req.session.user){
        res.redirect('/userHome')
    }else{
        res.render('userLogin');
    }
   
};

const renderSignupPage = (req, res) => {
    res.render('userSignup');
};

const insertUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
                
        const result = await user.save();
        console.log("Successfully registered:", result);
        res.redirect('/login');
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
};

const verifyUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });

        if (findUser) {
            if (findUser.isBlocked) {
                console.log("User is blocked. Cannot login.");
                res.status(403).json({ error: 'User is blocked. Cannot login.' });
                return;
            }
            const passMatch = await bcrypt.compare(password, findUser.password);
            if (passMatch) {
                console.log("Login successful. Password matched.");

                req.session.user = findUser;
                console.log(findUser);
        
                res.redirect('/userHome');
            } else {
                console.log("Password doesn't match");
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            console.log("User not found");
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log("Login failed");
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
};


const renderUserHome = (req, res) => {
    if (req.session.user) {
        console.log(req.session.user);
        res.setHeader('Cache-Control', 'no-store');
        res.render('userHome', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
};


const logoutUser = (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            res.status(500).json({ error: 'Logout failed. Please try again later.' });
        } else {
            res.redirect('/login');
        }
    });
};


module.exports = {
    insertUser,
    verifyUser,
    renderLoginPage,
    renderSignupPage,
    renderUserHome,
    logoutUser,
};
