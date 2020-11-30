module.exports = function (req, res, next) {
  res.status(200).render('404', {
    title: 'Страница не найдена',
  });
};
