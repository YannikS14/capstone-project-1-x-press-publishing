const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite',
);

artistsRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Artist WHERE is_currently_employed = 1',
    (err, artists) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ artists: artists });
      }
    },
  );
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get(
    'SELECT * FROM Artist WHERE id = $artistId',
    {
      $artistId: artistId,
    },
    (err, artist) => {
      if (err) {
        next(err);
      } else if (artist) {
        req.artist = artist;
        next();
      } else {
        res.status(404).send();
      }
    },
  );
});

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});

module.exports = artistsRouter;
