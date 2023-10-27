const { ERROR_CODE } = require('../utils/constants');

const errorProcessing = (err, req, res, next) => {
  const { status = err.status || ERROR_CODE.SERVER_ERROR, message } = err;
  res
    .status(status).send({
      message: status === ERROR_CODE.SERVER_ERROR
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
};

module.exports = errorProcessing;
