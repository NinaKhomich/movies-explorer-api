/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { NODE_ENV, SECRET_KEY } = process.env;
const { ValidationError, CastError } = mongoose.Error;

const User = require('../models/user');

const { SUCCESS_CODE, ERROR_CODE } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequest = require('../utils/errors/BadRequest');
const ConflictError = require('../utils/errors/ConflictError');

const getUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) throw new NotFoundError('Пользователь не найден');
      res.send(user);
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные при поиске пользователя'));
      } else next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    email,
    name,
    password,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Пользователь с таким email уже существует');
      }
      return bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({
            name,
            email,
            password: hash,
          })
            .then((newUser) => {
              res.status(SUCCESS_CODE.CREATED).send({
                name: newUser.name,
                email: newUser.email,
              });
            })
            .catch((err) => {
              if (err instanceof ValidationError) {
                next(new BadRequest('Переданы некорректные данные при создании пользователя'));
              }
            });
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? SECRET_KEY : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 360000 * 24 * 7,
          httpOnly: true,
          sameSite: 'strict',
        })
        .send({ token });
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход выполнен успешно' });
};

const updateUser = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) throw new NotFoundError('Пользователь не найден');

      res.send(user);
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при редактировании данных пользователя'));
      } else if (err.code === ERROR_CODE.DUPLICATE_KEY) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUser,
  createUser,
  updateUser,
  login,
  logout,
};
