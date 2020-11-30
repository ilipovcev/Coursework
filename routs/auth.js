const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { registerValidators } = require('../utils/validators');
const { loginValidators } = require('../utils/validators');

router.get('/', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  });
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth#login');
  });
});

router.post('/login', loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });
    console.log(candidate);
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);
      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }
          res.redirect('/');
        });
      } else {
        req.flash('loginError', 'Неверный пароль');
        res.redirect('/auth#login');
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует!');
      res.redirect('/auth#login');
    }
  } catch (e) {
    console.log(e);
  }
});

router.post('/register', registerValidators, async (req, res) => {
  console.log(req.body);
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth#register');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
      userPosts: { posts: [] },
    });
    await user.save();
    res.redirect('/auth#login');
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
