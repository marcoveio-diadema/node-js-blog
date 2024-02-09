const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// home page - GET
router.get('/', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs",
            descriptio: "Simple blog created with NodeJS, Express and MongoDB"
        }

        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{$sort: { createdAt: -1} }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        
        res.render('index', {
            locals,
            data,
            current: page,
            currentRoute: '/',
            nextPage: hasNextPage ? nextPage : null,
        });
    } catch (error) {
        console.log(error);
    }
});

// post page - GET
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById( { _id: slug});

        const locals = {
            title: data.title,
            description: "Simple blog created with NodeJs, Express and MongoDb."
        }

        res.render('post', { 
            locals,
            data,
            currentRoute: `/post/${slug}`
        });
    } catch (error) {
        console.log(error);
    }
    
});

// search post page - POST
router.post('/search', async (req, res) => {
    try {

        const locals = {
            title: "Search",
            description: "Simple blog created with NodeJs, Express and MongoDb."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")

        const data = await Post.find({
            $or: [
                { title: {$regex: new RegExp(searchNoSpecialChar, 'i')}},
                { body: {$regex: new RegExp(searchNoSpecialChar, 'i')}},
            ]
        });

        res.render('search', {
           data, 
           locals 
        });
    } catch (error) {
        console.log(error);
    }
    
});



// about page - GET
router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

module.exports = router;



// function insertPostData () {
//     Post.insertMany([
//         {
//             title: "Building a blog",
//             body: "this is the body text",
//         },
//         {
//             title: "Deployment of Node.js applications",
//             body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//             },
//         {
//             title: "Authentication and Authorization in Node.js",
//             body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//             },
//         {
//             title: "Understand how to work with MongoDB and Mongoose",
//             body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//             },
//         {
//             title: "build real-time, event-driven applications in Node.js",
//             body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//             },
//         {
//             title: "Discover how to use Express.js",
//             body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//             },
//     ])
// }

// insertPostData();