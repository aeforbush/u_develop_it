const mysql = require('mysql2');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const inputCheck = require('./utils/inputCheck');
const { isEnumBody } = require('@babel/types');

// express middleware
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// connection to mysql database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // mysql username
        user: 'root',
        // mysql password
        password: 'SRMa204@?ZC',
        database: 'election'
    },
    console.log('Connected to the election database.')
);
// return all data from candidates route
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data:rows
        });
    });
});

// GET a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT * FROM candidates WHERE id = ?`;
    // database call captured value populated in the req.params object assigned the key id to params
    // params is assigned as an array with a single element, req.params.id
    const params = [req.params.id];
    // database call then queries the candidates table with this id to retrieve the row specified
    db.query(sql, params, (err, row) => {
        if(err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// delete a candidate using the HTTP request method delete()
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.statusMessage(400).json({ error: res.message });
            // if the result is not in affected row 'candidate not found"
        } else if (!result.affectedRows) {
            res.json({
                message:'Candidate not found'
            });
        } else {
            res.json({
                message: 'deleted',
                // verify whether any rows were changed
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// create a candidate using the HTTP request method post()
// using object destructuring to pull the body property out of the request object ({body})= object req.body to populate the candidates data
app.post('/api/candidate', ({body}, res) => {
    // verification method to avoid creating anything other than a candidate
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected')
    if (errors) {
        res.status(400).json({error: errors});
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
            message: 'success',
            data: body 
        });
    });
});


// default response for any other request *needs to be at bottom (Not Found)
app.use((req, res) => {
    res.status(404).end();
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});