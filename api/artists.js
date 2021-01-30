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

artistsRouter.post('/', (req, res, next) => {
  if (
    !req.body.artist.name ||
    !req.body.artist.dateOfBirth ||
    !req.body.artist.biography
  ) {
    return res.status(400).send();
  }
  const isCurrentlyEmployed =
    req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

  db.run(
    'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)',
    {
      $name: req.body.artist.name,
      $dateOfBirth: req.body.artist.dateOfBirth,
      $biography: req.body.artist.biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          'SELECT * FROM Artist WHERE id = $lastID',
          {
            $lastID: this.lastID,
          },
          (err, artist) => {
            res.status(201).json({ artist: artist });
          },
        );
      }
    },
  );
});

artistsRouter.put('/:artistId', (req, res, next) => {
  if (
    !req.body.artist.name ||
    !req.body.artist.dateOfBirth ||
    !req.body.artist.biography ||
    !req.body.artist.isCurrentlyEmployed
  ) {
    return res.status(400).send();
  }
  db.run(
    'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId',
    {
      $name: req.body.artist.name,
      $dateOfBirth: req.body.artist.dateOfBirth,
      $biography: req.body.artist.biography,
      $isCurrentlyEmployed: req.body.artist.isCurrentlyEmployed,
      $artistId: req.params.artistId,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          'SELECT * FROM Artist WHERE id = $id',
          {
            $id: req.params.artistId,
          },
          (err, artist) => {
            res.status(200).json({ artist: artist });
          },
        );
      }
    },
  );
});

artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run(
    'UPDATE Artist SET is_currently_employed = 0 WHERE id = $id',
    {
      $id: req.params.artistId,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          'SELECT * FROM Artist WHERE id = $id',
          {
            $id: req.params.artistId,
          },
          (err, artist) => {
            res.status(200).json({ artist: artist });
          },
        );
      }
    },
  );
});

module.exports = artistsRouter;
