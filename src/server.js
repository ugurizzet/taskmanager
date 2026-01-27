const https = require('https');
const fs = require('fs');
const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`Secure server (HTTPS) is running: https://localhost:${PORT}`)
});