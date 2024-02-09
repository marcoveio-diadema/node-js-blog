require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');


// import MongoDB
const connectDB = require('./server/config/db');

const app = express();
const PORT = 3000 || process.env.PORT;

// connect to DB
connectDB();

const { isActiveRoute } = require('./server/helpers/routeHelpers');

// middlewhare
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}));

// static
app.use(express.static('public'));

// middleware for templating
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
});