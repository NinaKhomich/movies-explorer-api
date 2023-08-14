const routes = require('express').Router();

const NotFoundError = require('../utils/errors/NotFoundError');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const { createUser, login, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validateUserLogin, validateUserRegist } = require('../middlewares/validation');

routes.post('/signup', validateUserRegist, createUser);
routes.post('/signin', validateUserLogin, login);

routes.use(auth);
routes.use('/users', usersRouter);
routes.use('/movies', moviesRouter);
routes.use('/signout', logout);

routes.use('/', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = routes;
