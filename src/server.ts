// import express from 'express';

// const app = express();

// app.get('/{*splat}', (req, res) => {
//   console.log('path:', req.path);
//   console.log('splat:', req.params.splat);
//   res.send(`Pediste: ${req.path}`);
// });

// app.listen(3000, () => {
//   console.log('Escuchando en http://localhost:3000');
// });


import path from 'node:path';
import { createApp } from './app.js';

//TODO VARIABLES DE ENTORNO

const contentDir = process.env.CONTENT_DIR ?? path.resolve(process.cwd(), 'src/content');
const templatePath = process.env.TEMPLATE_PATH ?? path.resolve(process.cwd(), 'src/template.html');
const port = Number(process.env.PORT ?? 3000);

createApp({ contentDir, templatePath }).listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});