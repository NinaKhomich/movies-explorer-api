const router = require('express').Router();

const {
  getMovies,
  createMovie,
  deleteMovieById,
} = require('../controllers/movies');

const {
  validateMovie,
  validateMovieId,
} = require('../middlewares/validation');

router.get('/', getMovies);
router.post('/', validateMovie, createMovie);
router.delete('/:_id', validateMovieId, deleteMovieById);

module.exports = router;
