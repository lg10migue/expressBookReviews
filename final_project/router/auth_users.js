const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Filter the users array to check if the username already exists.
    let usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length === 0;
};

const authenticatedUser = (username, password) => {
    // Filter the users array to check if the username and password match.
    let user = users.filter(
        (user) => user.username === username && user.password === password
    );
    return user.length === 1;
};

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username of password is not empty.
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate the user.
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: password }, "fingerprint_customer", {
            expiresIn: 60 * 60,
        });

        // Save the token in the session.
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User logged in" });
    } else {
        return res
            .status(208)
            .json({ message: "Invalid login. Check username and password." });
    }
});

// Add a book review.
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Get the ISBN from the request.
    const isbn = req.params.isbn;

    // Get the review from the request.
    const review = req.query.review;

    // Get the username from the session.
    const username = req.session.authorization["username"];

    // Check if the book exists.
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Update the book with the review.
    books[isbn]["reviews"][username] = review;
    res.send(JSON.stringify(books[isbn], null, 4));
});

// Delete a book review.
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Get the ISBN from the request.
    const isbn = req.params.isbn;

    // Get the username from the session.
    const username = req.session.authorization["username"];

    // Check if the book exists.
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists.
    if (!books[isbn]["reviews"][username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review.
    delete books[isbn]["reviews"][username];
    res.send(JSON.stringify(books[isbn], null, 4));
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
