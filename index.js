const generateHash = require('crypto').createHash;
const fs = require('fs');
const path = require('path');

function getNextTime(ttl) {
    const now = new Date();
    const minutesToAdd = ttl - (now.getMinutes() % ttl);
    const nextTime = new Date(now.getTime() + minutesToAdd * 60000);
    const hours = nextTime.getHours().toString().padStart(2, '0');
    const newMinutes = nextTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${newMinutes}`;
}

function emptyDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
    }
}

function createDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
}

function createFileInDirectory(directoryPath, fileName, data) {
    if (!fs.existsSync(directoryPath)) {
        console.log(`Directory "${directoryPath}" doesn't exist. Creating it.`);
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    const filePath = path.join(directoryPath, fileName);

    try {
        data = JSON.stringify(data)
    } catch (error) {
        
    }

    fs.writeFileSync(filePath, data, 'utf8');
    console.log(`File "${fileName}" created in "${directoryPath}" with data.`);
}

function getFileContent(directoryPath, fileName) {
    const filePath = path.join(directoryPath, fileName);

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return content;
    } else {
        return false;
    }
}

module.exports = (configs = {}) => {

    configs = {
        ... {
            ttl: 5,                 // time to live per cache (in minutes)
            restart: true,          // restart cache when server restarts
            dir: './cache',         // cache directory
        },
        ... configs
    }

    if (fs.existsSync(configs.dir)) {
        if (configs.restart) {
            emptyDirectory(configs.dir);
        }
    } else {
        createDirectory(configs.dir);
    }

    return (req, res, next) => {

        const hash = generateHash('sha1').update(req._parsedUrl.pathname + getNextTime(configs.ttl)).digest('hex');
        let alreadyCached = getFileContent(configs.dir, hash)

        if (alreadyCached) {
            try {
                alreadyCached = JSON.parse(alreadyCached)
                return res.json(alreadyCached)
            } catch (error) {
                return res.send(alreadyCached);
            }
        }

        res.cache = function (data) {
            createFileInDirectory(configs.dir, hash, data)
            return this.send(data);
        };
    
        next();
    };
}
