import * as winston from 'winston';

import config from './config';

export async function init(): Promise<void>
{
  if (config.environment === 'dev')
  {
    (winston as any).level = 'silly';
  }

  process.on('unhandledRejection', (err: string, promise) =>
  {
    winston.error('unhandledRejection:');
    winston.error(err);
  });
}
