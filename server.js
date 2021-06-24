require('dotenv').load();

const http = require('http');
const app = require('./app');
const config = require('config');

app.on('error', (err) => {
  console.error('Server error', err);
});

http.createServer(app.callback()).listen(config.get('port'));
