import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import 'express-async-errors';
import * as gracefulExit from 'express-graceful-exit';
import * as expressPrettify from 'express-prettify';
import * as Sequelize from 'sequelize';
import * as swaggerUiDist from 'swagger-ui-dist';
import * as winston from 'winston';

import config from '../core/config';
import { NotFoundError, ValidationError } from '../core/errors';
import * as logFunctions from '../core/logs';
import customers from './customers';
import notes from './notes';
import swagger from './swagger';

(async function()
{
  try
  {
    await logFunctions.init();

    const app = express();

    app.enable('trust proxy');

    app.use(gracefulExit.middleware(app));
    app.use(bodyParser.json());
    app.use(expressPrettify({ always: true }));
    app.use(compression());

    app.use((req, res, next) =>
    {
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, Origin, Range, X-Requested-With');
      res.header('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, PATCH, POST, PUT');
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Expose-Headers', 'Link, X-Total-Count');

      if (req.method === 'OPTIONS')
      {
        res.end();
        return;
      }

      if (req.method === 'POST')
      {
        res.status(201);
      }

      next();
    });

    customers(app);
    notes(app);
    swagger(app);

    app.use((err, req, res, next) =>
    {
      let status = 500;
      if (err instanceof NotFoundError)
      {
        status = 404;
      }
      else if (err instanceof ValidationError)
      {
        winston.debug(status.toString(), err);
        res.status(400).send(err.messages);
        return;
      }
      else if (err instanceof Sequelize.UniqueConstraintError)
      {
        winston.debug(status.toString(), err);
        const validationError = err as Sequelize.UniqueConstraintError;
        res.status(400).send(validationError.errors.map(error => error.message));
        return;
      }

      if (status === 500)
      {
        winston.error(`${req.method} ${req.path} ${status}`);
        winston.error(err);
      }
      else
      {
        winston.debug(`${req.method} ${req.path} ${status}`);
      }

      res.status(status).end();
    });

    app.use('', express.static(swaggerUiDist.absolutePath()));

    const port = config.environment === 'dev' ? 3000 : 80;
    app.listen(port, () =>
    {
      winston.info('Propellerhead API is alive.');
    });
  }
  catch (err)
  {
    winston.error(err);
  }
})();
