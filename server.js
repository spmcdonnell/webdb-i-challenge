const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

// GET
server.get('/', (req, res) => {
    db('accounts')
        .then(accounts => {
            res.status(200).json(accounts);
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
});

server.get('/:id', validateId, (req, res) => {
    res.status(200).json(req.account);
});

// POST
server.post('/', validateAccount, (req, res) => {
    db('accounts')
        .insert(req.body)
        .then(account => {
            res.status(200).json(account);
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
});

// PUT
server.put('/:id', validateId, validateAccount, (req, res) => {
    const id = req.params.id;

    db('accounts')
        .where({ id })
        .update(req.body)
        .then(account => {
            res.status(200).json(account);
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
});

// DELETE
server.delete('/:id', validateId, (req, res) => {
    const id = req.params.id;

    db('accounts')
        .where({ id })
        .del()
        .then(account => {
            res.status(200).json(account);
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
});

// Middleware
function validateAccount(req, res, next) {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
        res.status(400).json({ message: 'missing post data' });
    }

    const name = req.body.name;
    const budget = req.body.budget;

    if (name && budget) {
        if (typeof name === 'string' && typeof budget === 'number') {
            next();
        } else if (typeof name !== 'string' && typeof budget !== 'number') {
            res.status(400).json({ message: 'name must be a string and budget must be a number' });
        } else if (typeof name !== 'string') {
            res.status(400).json({ message: 'name must be a string' });
        } else if (typeof budget !== 'number') {
            res.status(400).json({ message: 'budget must be a number' });
        } else {
            res.status(500).json({ message: 'There is an unknown error in the format of the data attempting to be posted' });
        }
    } else if (!name && !budget) {
        res.status(400).json({ message: 'You are missing name and budget fields' });
    } else if (!name) {
        res.status(400).json({ message: 'You are missing a name field' });
    } else if (!budget) {
        res.status(400).json({ message: 'You are missing a budget field' });
    }
}

function validateId(req, res, next) {
    const id = req.params.id;

    db('accounts')
        .where({ id })
        .then(account => {
            if (account.length) {
                req.account = account;
                next();
            } else {
                res.status(404).json({ message: 'The account ID is invalid' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error, message: 'There was a server error while attempting to retrieve accounts' });
        });
}

module.exports = server;
