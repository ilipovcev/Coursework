const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  res.render('personal-lenta', {
    title: 'Личная лента',
  });
});

module.exports = router;
