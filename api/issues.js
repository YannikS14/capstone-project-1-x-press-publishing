const express = require('express');
const issuesRouter = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite',
);

issuesRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Issue WHERE series_id = $seriesID',
    { $seriesID: req.params.seriesId },
    (err, issues) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ issues: issues });
      }
    },
  );
});

issuesRouter.post('/', (req, res, next) => {
  if (
    !req.body.issue.name ||
    !req.body.issue.issueNumber ||
    !req.body.issue.publicationDate ||
    !req.body.issue.artistId
  ) {
    return res.status(400).send();
  }
  db.run(
    'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)',
    {
      $name: req.body.issue.name,
      $issueNumber: req.body.issue.issueNumber,
      $publicationDate: req.body.issue.publicationDate,
      $artistId: req.body.issue.artistId,
      $seriesId: req.params.seriesId,
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        db.get(
          'SELECT * FROM Issue WHERE id = $id',
          {
            $id: this.lastID,
          },
          (err, issue) => {
            res.status(201).json({ issue: issue });
          },
        );
      }
    },
  );
});

issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(
    'SELECT * FROM Issue WHERE id = $issueId',
    {
      $issueId: issueId,
    },
    (err, issue) => {
      if (err) {
        next(err);
      } else if (issue) {
        req.issue = issue;
        next();
      } else {
        res.status(404).send();
      }
    },
  );
});

issuesRouter.put('/:issueId', (req, res, next) => {
  if (
    !req.body.issue.name ||
    !req.body.issue.issueNumber ||
    !req.body.issue.publicationDate ||
    !req.body.issue.artistId
  ) {
    res.status(400).send();
  }
  db.run(
    'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId WHERE id = $issueId',
    {
      $name: req.body.issue.name,
      $issueNumber: req.body.issue.issueNumber,
      $publicationDate: req.body.issue.publicationDate,
      $artistId: req.body.issue.artistId,
      $seriesId: req.params.seriesId,
      $issueId: req.params.issueId,
    },
    (err, issue) => {
      if (err) {
        next(err);
      } else {
        db.get(
          'SELECT * FROM Issue WHERE id = $issueId',
          {
            $issueId: req.params.issueId,
          },
          (err, issue) => {
            res.status(200).json({ issue: issue });
          },
        );
      }
    },
  );
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.get(
    'SELECT * FROM Issue WHERE id = $issueId',
    { $issueId: req.params.issueId },
    (err, issue) => {
      if (err) {
        next(err);
      } else {
        db.run(
          'DELETE FROM Issue WHERE id = $issueId',
          {
            $issueId: req.params.issueId,
          },
          (err) => {
            if (err) {
              next(err);
            } else {
              res.status(204).send();
            }
          },
        );
      }
    },
  );
});

module.exports = issuesRouter;
