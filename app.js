require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const compression = require('compression');
const postRouter = require('./routs/post');
const authRouter = require('./routs/auth');
const homeRouter = require('./routs/home');
const loadPersonalRouter = require('./routs/loadPersonal');
const personalRouter = require('./routs/personal');
const path = require('path');
const app = express();
const port = process.env.PORT;
const clientPath = path.join(__dirname, 'client');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoBlog = require('connect-mongodb-session')(session);
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorMiddleware = require('./middleware/error');

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(bodyParser.json());

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
});

const blog = new MongoBlog({
  collection: 'sessions',
  uri: process.env.MONGODB_URI,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(clientPath));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: blog,
  })
);

app.use(flash());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/api/post/', postRouter);
app.use('/', homeRouter);
app.use('/auth', authRouter);
app.use('/personal', loadPersonalRouter);
app.use('/personal/posts', personalRouter);

app.use(errorMiddleware);

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (e) {
    console.log(e);
  }
}
start();
