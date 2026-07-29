import http from 'node:http';
import { reqHandler } from '../dist/haisrilanka/server/server.mjs';

const server = http.createServer((req, res) => {
  Promise.resolve(reqHandler(req, res)).catch((err) => {
    console.error('handler error', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(String(err));
    }
  });
});

function request(path, host) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4056,
        path,
        headers: { Host: host },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, data }));
      },
    );
    req.on('error', reject);
    req.end();
  });
}

server.listen(4056, async () => {
  try {
    for (const [path, host] of [
      ['/en', 'www.haisrilanka.com'],
      ['/en/day-tours', 'haisrilanka.com'],
      ['/en', '127.0.0.1:4056'],
    ]) {
      const { status, data } = await request(path, host);
      const title = (data.match(/<title>(.*?)<\/title>/i) || [])[1] || '';
      console.log(
        JSON.stringify({
          path,
          host,
          status,
          len: data.length,
          title: title.slice(0, 90),
          blocked: data.includes('not allowed'),
          ssr: /ng-server|_nghost/.test(data),
        }),
      );
    }
  } finally {
    server.close();
  }
});
