/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');

const { NODE_ENV, SECRET_KEY } = process.env;

const Unauthorized = require('../utils/errors/Unauthorized');

const auth = (req, res, next) => {
  // достаём авторизационный заголовок
  const authorizationToken = req.headers.authorization;

  // убеждаемся, что он есть или начинается с Bearer
  if (!authorizationToken || !authorizationToken.startsWith('Bearer ')) {
    return next(new Unauthorized('Необходима авторизация'));
  }

  // извлечём токен
  const token = authorizationToken.replace('Bearer ', '');
  let payload;

  // верифицируем токен
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? SECRET_KEY : 'dev-secret');
  } catch (err) {
    return next(new Unauthorized('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса
  return next(); // пропускаем запрос дальше
};

module.exports = auth;
