'use strict'

const express = require('express');
const app = module.exports = express()
const cache = require('../index')

app.use(cache({
    ttl: 5,         // time to live per cache (in minutes)
    restart: true,  // restart cache when server restarts
    dir: './cache', // cache directory
}))

app.get('/', async function(req, res){
    await new Promise(resolve => setTimeout(resolve, 5000))

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return res.cache(`processed and cached at ${hours}:${minutes}:${seconds} `);
});


if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}