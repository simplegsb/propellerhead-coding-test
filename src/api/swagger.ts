import * as fs from 'fs';

import * as express from 'express';
import * as swaggerUiDist from 'swagger-ui-dist';

import definition from './open-api';

// This pattern of modifying the index file is weird but it was recommended here...
// https://github.com/swagger-api/swagger-ui/issues/4624
let swaggerIndexContent = fs.readFileSync(`${swaggerUiDist.absolutePath()}/index.html`).toString();
swaggerIndexContent = swaggerIndexContent.replace('https://petstore.swagger.io/v2/swagger.json', 'swagger.json');

export default function(app: express.Express): void
{
  app.get('', (req: express.Request, res: express.Response) =>
  {
    res.send(swaggerIndexContent);
  });

  app.get('/index.html', (req: express.Request, res: express.Response) =>
  {
    res.send(swaggerIndexContent);
  });

  app.get('/swagger.json', (req: express.Request, res: express.Response) =>
  {
    res.send(definition);
  });
}
