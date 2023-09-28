const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const validation = require('./lib/validation');

/**
 * @param {Object} configs              - Configuration options.
 * @param {string} configs.ttl          - Cache time to live (default: '10 * 60 * 1000').
 * @param {string} configs.dir          - Directory to save cache (default: './cache').
 * @param {string} configs.dump         - Dump all cache (default: '60 * 60 * 1000').
 * @param {string} configs.restart      - Restart cache when server restarts (default: 'false').
 * @param {string} configs.verbose      - Verbose mode (default: 'false').
 * @param {string} configs.enabled      - Enable/disable cache (default: 'true').
 * @param {string} configs.httpCodes    - Http codes to cache (default: '[200, 201, 202, 203, 204, 205, 206, 207, 208, 226]').
 * @returns {Function} - Express middleware.
 */
module.exports = function (configs = {}) {
    configs = { ...{

        enabled: true,          // enable/disable cache
        ttl: 10 * 60 * 1000,    // time to live per cache
        dump: 60 * 60 * 1000,   // dump all cache every 1 hour
        restart: false,         // restart cache when server restarts
        httpCodes: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226], // http codes to cache

        verbose: false,         // verbose mode
        dir: './cache',         // cache directory

    }, ...configs} ;

    // validate configs
    validation.configs(configs);

    // create cache dir if not exists
    if (!fs.existsSync(configs.dir)) {
        fs.mkdirSync(configs.dir);
    }

    // clear cache dir
    if (configs.restart) {
        if (configs.verbose) console.log('clearing cache directory...');
        fs.readdirSync(configs.dir).forEach(file => {
            fs.unlinkSync(configs.dir + '/' + file);
        });
    }

    let dumpUnix = Math.floor(Date.now() / 1000) + (configs.dump / 1000);

    setInterval(() => {
        if (Math.floor(Date.now() / 1000) >= dumpUnix) {
            if (configs.verbose) console.log('clearing cache directory...');
            fs.readdirSync(configs.dir).forEach(file => {
                fs.unlinkSync(configs.dir + '/' + file);
            });
            dumpUnix = Math.floor(Date.now() / 1000) + (configs.dump / 1000);
        }
    }, 1000);

    if (!configs.enabled) return (res, req, next) => next();

    return async (req, res, next) => {

        const url = req.originalUrl;
        const hash = crypto.createHash('sha256').update(url).digest('hex');
        const httpCode = res.statusCode;

        if (!configs.httpCodes.includes(httpCode)) return next();

        const c = await new Promise((res) => {
            fs.readdir(configs.dir, async (err, files) => {
                if (err) res(null);
    
                for (const file of files) {
                    const fileHash = file.split('-')[0];
                    const fileUnix = parseInt(file.split('-')[1]);
    
                    if (fileHash === hash && fileUnix > Math.floor(Date.now() / 1000)) {
                        if (configs.verbose) console.log('serving from cache...');
    
                        const content = await fs.readFileSync(path.join(configs.dir, file), 'utf8');
                        const opts = {}
    
                        content.split('\n').forEach((line) => {
                            if (line.startsWith('method')) opts.method = line.split(':')[1].trim();
                            if (line.startsWith('contentType')) opts.contentType = line.split(':')[1].trim();
                            if (line.startsWith('httpCode')) opts.httpCode = parseInt(line.split(':')[1].trim());
                            if (line.startsWith('body')) opts.body = line.substring(5);
                        });
    
                        res(opts);
                    }
                }
                res(null);
            });
        })

        if (c) {
            res.statusCode = c.httpCode;
            res.set('Content-Type', c.contentType);
            res.send(c.body);
            return;
        }

        res.oldSend = res.send;
        res.send = (body) => {

            const unix = Math.floor(Date.now() / 1000) + (configs.ttl / 1000);
            const fileName = hash + '-' + unix;
            const method = req.method;
            const httpCode = res.statusCode;
            let contentType = 'text/html';
            if (res.get('Content-Type')) contentType = res.get('Content-Type').split(';')[0];

            const data = `url: ${url}\nmethod:${method}\ncontentType:${contentType}\nhttpCode: ${httpCode}\nbody:${body}`;
            fs.writeFile(path.join(configs.dir, fileName), data, (err) => {});

            return res.oldSend(body);
        };
        next();
    }
}