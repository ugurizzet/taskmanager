const https = require('https');
const fs = require('fs');
const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

setInterval(()=>{
    const now = new Date().toISOString();
    db.run("DELETE FROM refresh_tokens WHERE expires_at < ?", [now], function(err){
        if(err){
            console.error("temizlik hatasi:", err);
        } else {
            if (this.changes > 0) {
                console.log(`${this.changes} adet olu token silindi`)
            }
        }
    })
},60 * 60 * 1000); 

https.createServer(options, app).listen(PORT, () => {
    console.log(`Secure server (HTTPS) is running: https://localhost:${PORT}`)
});