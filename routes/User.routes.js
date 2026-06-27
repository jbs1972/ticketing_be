const auth = require('../middleware/Auth.middleware');
const admin = require('../middleware/Admin.middleware');
const _ = require('lodash');
const { User, validate } = require('../models/User.model');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

router.get('/me', auth, async (req, res) => {
    const users = await User.findById(req.user._id).select('-password');
    res.json({ message: 'User fetched successfully', data: users, status: 'success' });
});

router.post('/', auth, admin, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message, data: null, status: 'error' });

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: 'User already registered.', data: null, status: 'error' });

    // user = new User({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password
    // });

    user = new User(_.pick(req.body, ['name', 'email', 'password', 'isAdmin']));
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    //   res.send(user);

    // res.send({
    //     name: user.name,
    //     email: user.email
    // });
    
    // res.send(_.pick(user, ['_id', 'name', 'email']));

    const token = user.getAuthToken();

    // const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
    res.header('x-auth-token', token).json({ message: 'User registered successfully', data: _.pick(user, ['_id', 'name', 'email']), status: 'success' }); 
});

module.exports = router;