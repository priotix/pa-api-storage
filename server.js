require('dotenv').load();

const http = require('http');
const config = require('config');
const app = require('./app');

app.on('error', (err) => {
  console.error('Server error', err);
});

http.createServer(app.callback()).listen(config.get('port'));
