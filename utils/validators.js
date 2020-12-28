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
  body('password', 'Пароль должен быть минимум 6 символов').isLength({
    min: 6,
  }),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать!');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3, max: 32 })
    .withMessage('Имя не должно содержать более 32 символов!')
    .trim()
    .escape(),
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
  body('password', 'Пароль должен быть минимум 6 символов').isLength({
    min: 6,
  }),
];

exports.postValidators = [body('text').escape()];
