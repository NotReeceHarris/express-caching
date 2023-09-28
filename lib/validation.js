const configs = (configs) => {

    /*{

        enabled: true,          // enable/disable cache
        ttl: 10 * 60 * 1000,    // time to live per cache
        dump: 60 * 60 * 1000,   // dump all cache every 1 hour
        restart: false,         // restart cache when server restarts
        verbose: false,         // verbose mode

        dir: './cache',         // cache directory

    }*/

    // enabled validation
    if (typeof configs.enabled !== 'boolean') throw new Error('enabled must be a boolean');

    // ttl validation
    if (typeof configs.ttl !== 'number') throw new Error('ttl must be a number');
    if (configs.ttl < 0) throw new Error('ttl must be a positive number');
    if (configs.ttl === 0) throw new Error('ttl must be greater than zero');
    if (configs.ttl > 2147483647) throw new Error('ttl must be less than 2147483647');
    if (configs.ttl % 1 !== 0) throw new Error('ttl must be an integer');

    // dir validation
    if (typeof configs.dir !== 'string') throw new Error('dir must be a string');
    if (configs.dir.length === 0) throw new Error('dir must not be empty');
    if (configs.dir.match(/[^a-zA-Z0-9_\-/~./]/)) throw new Error('dir must be alphanumeric and can contain /, ., and ~');
    if (configs.dir.match(/\/\//)) throw new Error('dir must not contain double slashes');
    if (configs.dir.match(/^\//)) throw new Error('dir must not start with a slash');
    if (configs.dir.match(/\/$/)) throw new Error('dir must not end with a slash');

    // dump validation
    if (typeof configs.dump !== 'number') throw new Error('dump must be a number');
    if (configs.dump < 0) throw new Error('dump must be a positive number');
    if (configs.dump === 0) throw new Error('dump must be greater than zero');
    if (configs.dump > 2147483647) throw new Error('dump must be less than 2147483647');
    if (configs.dump % 1 !== 0) throw new Error('dump must be an integer');

    // restart validation
    if (typeof configs.restart !== 'boolean') throw new Error('restart must be a boolean');

    // httpCodes validation
    if (!Array.isArray(configs.httpCodes)) throw new Error('httpCodes must be an array');
    if (configs.httpCodes.length === 0) throw new Error('httpCodes must not be empty');
    if (configs.httpCodes.some(isNaN)) throw new Error('httpCodes must contain only numbers');
    if (configs.httpCodes.some(x => x < 100)) throw new Error('httpCodes must contain only positive numbers');
    if (configs.httpCodes.some(x => x > 599)) throw new Error('httpCodes must contain only numbers less than 600');
    if (configs.httpCodes.some(x => x % 1 !== 0)) throw new Error('httpCodes must contain only integers');

    // verbose validation
    if (typeof configs.verbose !== 'boolean') throw new Error('verbose must be a boolean');

}

module.exports = {configs};