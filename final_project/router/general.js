const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get the list of books using axios.
const asyncBooks = {};

// Function to get the list of books.
async function loadBooks() {
    try {
        const response = await axios.get("http://localhost:8080/");
        for (let key in response.data) {
            asyncBooks[key] = response.data[key];
        }
    } catch (error) {
        console.error("Error loading books: ", error);
    }
}

// Load the books.
loadBooks();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        // Check if the user does not already exist.
        if (isValid(username)) {
            users.push({ username: username, password: password });
            return res.status(200).json({
                message: "User registered successfully. Now you can login",
            });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop.
public_users.get("/", function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN.
public_users.get("/isbn/:isbn", async function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(asyncBooks[isbn], null, 4));
});

// Get book details based on author.
public_users.get("/author/:author", async function (req, res) {
    const author = req.params.author;
    let author_books = {};
    for (let key in asyncBooks) {
        if (books[key].author === author) {
            author_books[key] = asyncBooks[key];
        }
    }
    res.send(JSON.stringify(author_books, null, 4));
});

// Get all books based on title.
public_users.get("/title/:title", async function (req, res) {
    const title = req.params.title;
    let title_books = {};
    for (let key in asyncBooks) {
        if (books[key].title === title) {
            title_books[key] = asyncBooks[key];
        }
    }
    res.send(JSON.stringify(title_books, null, 4));
});

// Get book review.
public_users.get("/review/:isbn", async function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(asyncBooks[isbn].reviews, null, 4));
});

module.exports.general = public_users;
