const http = require('http');

const options = {
  host: 'localhost',
  port: 3001,
  path: '/api/health',
  timeout: 2000,
};

const healthCheck = http.request(options, (res) => {
  console.log(`HEALTHCHECK: STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (err) => {
  console.error('HEALTHCHECK: ERROR', err);
  process.exit(1);
});

healthCheck.end();
