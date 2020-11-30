const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb('Error: images only', false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});
