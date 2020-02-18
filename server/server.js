'use strict';

const express = require('express');
const path = require('path');
const fallback = require('express-history-api-fallback');
const app = express();

var root = path.resolve(__dirname, '..', 'packedDir');
var rootImg = path.resolve(__dirname, '..', 'public');
app.use(express.static(root));
app.use(express.static(rootImg));
app.use(fallback('start.html', { root: root }));
app.use(fallback('start.html', { root: rootImg }));


const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening port ${port}`);
});