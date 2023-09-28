'use strict'

const express = require('express');
const app = module.exports = express()
const cache = require('../index')

app.use(cache({
    ttl: 10 * 60 * 1000,    // time to live per cache
    dump: 60 * 60 * 1000,   // dump all cache every 1 hour
    restart: true,         // restart cache when server restarts
    verbose: true,         // verbose mode
    dir: './cache',         // cache directory
}))

app.get('/', function(req, res){
    console.log('Executing index')
    res.send(`<h1>Index</h1><a href="/">index</a><br><a href="/foo">foo</a><br><a href="/barr">barr</a><br><a href="/json">json</a><p>Rendered on ${new Date()}</p>`);
});

app.get('/foo', function(req, res){
    console.log('Executing foo')
    res.send(`<h1>Foo</h1><a href="/">index</a><br><a href="/foo">foo</a><br><a href="/barr">barr</a><br><a href="/json">json</a><p>Rendered on ${new Date()}</p>`);
});

app.get('/barr', function(req, res){
    console.log('Executing barr')
    res.send(`<h1>Barr</h1><a href="/">index</a><br><a href="/foo">foo</a><br><a href="/barr">barr</a><br><a href="/json">json</a><p>Rendered on ${new Date()}</p>`);
});

app.get('/json', function(req, res){
    console.log('Executing json')
    res.json({
        index: req.protocol + '://' + req.get('host') + '/',
        foo: req.protocol + '://' + req.get('host') + '/foo',
        bar: req.protocol + '://' + req.get('host') + '/bar',
        json: req.protocol + '://' + req.get('host') + '/json',
        date: new Date(),
    });
});

if (!module.parent) {
    app.listen(80);
    console.log('Express started on port 3000');
}