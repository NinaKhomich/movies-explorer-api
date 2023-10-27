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
  Movie.findById(req.params._id)
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

// {
//   "country": "Великобритания",
//   "director": "Уилл Лавлейс, Дилан Сотерн",
//   "duration": 104,
//   "year": "2010",
//   "description": "Затеянный по та",
//   "image": "https://api.nomoreparties.co/beatfilm-movies/uploads/blur_a43fcf463d.jpeg",
//   "trailerLink": "https://www.youtube.com/watch?v=6iYxdghpJZY",
//   "thumbnail": "https://api.nomoreparties.co/uploads/thumbnail_blur_a43fcf463d.jpeg",
//   "owner": "64ee6722a621a72e9ad15bd6",
//   "movieId": 3,
//   "nameRU": " Без обратного пути",
//   "nameEN": "No Distance Left to Run",
//   "_id": "64ee685ca621a72e9ad15bdb",
//   "__v": 0}
