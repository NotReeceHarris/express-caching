# Express Caching

Express Caching is a middleware for Express.js designed to optimize response times by implementing caching strategies for HTML content.

## Getting Started

To leverage the benefits of Express Caching, simply replace your existing `res.send` or `res.render` functions with `res.cache`. Please note that this middleware is specifically tailored for handling HTML responses.

## Installation

You can install the `express-caching` package via npm or yarn:

```bash
npm install express-caching
```

```bash
yarn add express-caching
```

## Usage

1. First, import the `express-caching` middleware into your Express.js application:

```javascript
const express = require('express');
const cache = require('express-caching');

const app = express();

app.use(cache({
    ttl: 5,         // time to live per cache (in minutes)
    restart: true,  // restart cache when server restarts
    dir: './cache', // cache directory
}))
```

2. Use the middleware in your route handler by calling `res.cache`:

```javascript
app.get('/your-route', (req, res) => {
  // Your route logic here

  res.cache(htmlData); // Replace res.send or res.render with res.cache
});
```

That's it! Your Express.js application will now benefit from caching for HTML responses, reducing the load on your templating and logic processes.

Please remember to configure caching settings as needed for your specific use case, depending on your application's requirements.

## Note

This middleware focuses exclusively on optimizing HTML content, and may not be suitable for other data types or response formats.