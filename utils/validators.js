const { body } = require('express-validator');
const User = require('../models/User');

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Такой email уже занят');
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body('password', 'Пароль должен быть минимум 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать!');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3, max: 15 })
    .withMessage('Имя должно быть минимум 3 символа и максимум 15 символов')
    .trim()
    .escape()
    .custom((value, { req }) => {
      try {
        const regScript = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
        const regHTML = /<[^<>]+>/gi;

        if (value.match(regScript)) {
          throw new Error('Введите корректное имя!');
        }
        if (value.match(regHTML)) {
          throw new Error('Введите корректное имя!');
        }
      } catch (e) {
        console.log(e);
      }
    }),
];

exports.loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (!user) {
          return Promise.reject('Пользователя с таким email не существует!');
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body('password', 'Пароль должен быть минимум 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
];
