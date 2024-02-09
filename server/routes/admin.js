const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


// middleware for login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

// admin --- GET 
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple blog created with NodeJs"
        }        
        res.render('admin/index', { locals, layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});


// admin check login --- POST 
router.post('/admin', async (req, res) => {
    try {  
        const { username, password} = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials '});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials '});
        }

        const token = jwt.sign({ userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});
        

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});


// admin register --- POST 
router.post('/register', async (req, res) => {
    try {  
        const { username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword});
            res.status(201).json({ message: 'User created successfuly', user});
        } catch (error) {
            if(error.code === 11000) {
                res.status(409).json({message: 'User already in use'});
            }
            res.status(500).json({message: 'internal server error'});
        }

    } catch (error) {
        console.log(error);
    }
});


// admin dashboard --- GET 
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple blog created with NodeJs"
        }    

        const data = await Post.find();

        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

// admin create new post --- GET 
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple blog created with NodeJs"
        }    

        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});


// admin create new post --- POST 
router.post('/add-post', authMiddleware, async (req, res) => {
    try {

        try {
            // grab data from form
            const newPost = new Post ({
                title: req.body.title,
                body: req.body.body
            })
            // create post on DB
            await Post.create(newPost);

            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});


// admin edit new post --- GET
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Simple blog created with NodeJs"
        }  

       const data = await Post.findOne({ _id: req.params.id});

        res.render('admin/edit-post', {
            data, 
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});


// admin edit new post --- PUT
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

// admin delete post --- POST
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
        await Post.deleteOne({ _id: req.params.id});

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

// admin logout --- GET
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});



// home --- GET 
// router.get('/', async (req, res) => {
//     const locals = {
//         title: "NodeJs Blog",
//         description: "Simple blog created with NodeJs"
//     }

//     try {
//         const data = await Post.find();
//         res.render('index', { locals, data});
//     } catch (error) {
//         console.log(error);
//     }
// });


module.exports = router;