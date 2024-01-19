const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const nocache=require("nocache")
const session = require('express-session');
const path = require('path');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const adminRoute=require('./routes/adminRoute')


mongoose.connect('mongodb://127.0.0.1:27017/admin-user');
const Db = mongoose.connection.useDb('admin-user');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongodb error'));
db.once('open', () => {
    console.log('connected');
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: 'your-secret-key',
    })
);

app.use(nocache())

app.use('/', userRoute);
app.use(adminRoute);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});



app.listen(2244, () => {
    console.log('Server is running on port 2244');
});
