const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const inputCheck = require("../../utils/inputCheck");




// return all data from candidates route
router.get("/candidates", (req, res) => {
  const sql = `SELECT candidates.*, parties.name
                  AS party_name
                  FROM candidates
                  LEFT JOIN parties
                  ON candidates.party_id = parties.id`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// GET a single candidate
router.get("/candidate/:id", (req, res) => {
  const sql = `SELECT candidates.*, parties.name
                  AS party_name
                  FROM candidates
                  LEFT JOIN parties
                  ON candidates.party_id = parties.id
                  WHERE candidates.id = ?`;
  // database call captured value populated in the req.params object assigned the key id to params
  // params is assigned as an array with a single element, req.params.id
  const params = [req.params.id];
  // database call then queries the candidates table with this id to retrieve the row specified
  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

// create a candidate using the HTTP request method post()
// using object destructuring to pull the body property out of the request object ({body})= object req.body to populate the candidates data
router.post("/candidate", ({ body }, res) => {
    // verification method to avoid creating anything other than a candidate
    const errors = inputCheck(
      body,
      "first_name",
      "last_name",
      "industry_connected"
    );
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // database call logic
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: body,
      });
    });
  });

// update a candidate's party
router.put("/candidate/:id", (req, res) => {
  const errors = inputCheck(req.body, "party_id");

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `UPDATE candidates SET party_id = ? WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      // check if a record was found
    } else if (!result.affectedRows) {
      res.json({
        message: "Candidate not found",
      });
    } else {
      res.json({
        message: "success",
        data: req.body,
        changes: result.affectedRows,
      });
    }
  });
});

// delete a candidate using the HTTP request method delete()
router.delete("/candidate/:id", (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
      // if the result is not in affected row 'candidate not found"
    } else if (!result.affectedRows) {
      res.json({
        message: "Candidate not found",
      });
    } else {
      res.json({
        message: "deleted",
        // verify whether any rows were changed
        changes: result.affectedRows,
        id: req.params.id,
      });
    }
  });
});


module.exports = router;