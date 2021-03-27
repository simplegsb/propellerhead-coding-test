import * as express from 'express';

import { Request } from '../../core/models';
import { sequelize } from '../../data/sequelize';

export default async function(req: Request, res: express.Response, next: express.NextFunction): Promise<void>
{
  try
  {
    await sequelize.transaction(transaction =>
    {
      req.context = { transaction };

      return new Promise<void>((resolve, reject) =>
      {
        res.on('finish', () =>
        {
          if (res.statusCode < 400)
          {
            resolve();
          }
          else
          {
            reject();
          }
        });

        res.on('error', reject);

        next();
      });
    });
  }
  catch (err)
  {
    next(err);
  }
}
