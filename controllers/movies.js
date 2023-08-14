const mongoose = require('mongoose');

const Movie = require('../models/movie');

const { ValidationError, CastError } = mongoose.Error;
const { SUCCESS_CODE } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequest = require('../utils/errors/BadRequest');
const Forbidden = require('../utils/errors/Forbidden');

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    trailerLink,
    nameRU,
    nameEN,
    image,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    trailerLink,
    nameRU,
    nameEN,
    image,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(SUCCESS_CODE.CREATED).send(movie))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Переданы некорректные данные при добавлении фильма'));
      } else next(err);
    });
};

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

const deleteMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) throw new NotFoundError('Фильм не найден');
      if (movie.owner.toString() !== req.user._id) {
        throw new Forbidden('Нельзя удалять чужие фильмы');
      }
      Movie.deleteOne(movie)
        .then(() => res.send({ data: movie }))
        .catch(next);
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('Переданы некорректные данные для удаления фильма'));
      } else next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovieById,
};
