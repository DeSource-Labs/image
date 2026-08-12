import { CommonEngine, createNodeRequestHandler, isMainModule } from '@angular/ssr/node';
import { createDsImageMiddleware } from '@desource/angular-image/server';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server.js';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');
const app = express();
const commonEngine = new CommonEngine({
  allowedHosts: ['localhost', '127.0.0.1', '::1']
});

app.use(
  createDsImageMiddleware({
    dirs: [browserDistFolder]
  })
);

app.use(
  express.static(browserDistFolder, {
    maxAge: '0',
    index: false,
    redirect: false
  })
);

app.use((req, res, next) => {
  const protocol = req.protocol;
  const host = req.get('host');

  if (!host) {
    res.status(400).send('Missing host header');
    return;
  }

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      publicPath: browserDistFolder,
      url: `${protocol}://${host}${req.originalUrl}`
    })
    .then((html) => res.send(html))
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4000);
  app.listen(port, () => {
    console.log(`Angular SSR server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
