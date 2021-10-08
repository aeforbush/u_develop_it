const { moduleExpression } = require("@babel/types");
const mysql = require("mysql2");

// connection to mysql database
const db = mysql.createConnection(
    {
      host: "localhost",
      // mysql username
      user: "root",
      // mysql password
      password: "SRMa204@?ZC",
      database: "election",
    },
    console.log("Connected to the election database.")
  );


  module.exports = db;