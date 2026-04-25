import http from 'node:http';

const url = 'http://localhost:3000';

const req = http.get(url, (res) => {
  if (res.statusCode >= 200 && res.statusCode < 400) {
    console.log(`Smoke test passed: ${res.statusCode}`);
    process.exit(0);
  } else {
    console.error(`Smoke test failed: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(`Smoke test failed: ${err.message}`);
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.error('Smoke test timed out');
  req.destroy();
  process.exit(1);
});
