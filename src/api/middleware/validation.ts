import * as express from 'express';
import * as Sequelize from 'sequelize';

import { ValidationError } from '../../core/errors';
import { CommonModel } from '../../core/models';
import * as sequelize from '../../data/sequelize';
import { isExcluded, isIncluded } from '../../data/util';
import openApiDefinition from '../open-api';
import { Operation, Reference, RequestBody } from '../open-api/schema';

// TODO Test all endpoint validation

export default async function(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>
{
  try
  {
    const pathRegex = new RegExp(`^${req.path}$`
      .replace(/[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/, '{\\w+}')
      .replace(/\d+.m3u8/, '{\\w+}.m3u8'));

    for (const path of Object.keys(openApiDefinition.paths))
    {
      if (!path.match(pathRegex))
      {
        continue;
      }

      const operation = openApiDefinition.paths[path][req.method.toLowerCase()] as Operation;

      if (operation.requestBody && req.headers['content-type'])
      {
        const requestBody = operation.requestBody as RequestBody;

        const requestBodySchema = requestBody.content[req.headers['content-type'].split(';')[0]].schema as Reference;
        const componentName = requestBodySchema.$ref.substring(requestBodySchema.$ref.lastIndexOf('/') + 1);
        const modelName = componentName[0].toUpperCase() + componentName.substring(1);
        const sequelizeModel = sequelize[modelName] as sequelize.ModelClass;
        await validate(sequelizeModel, req.body);
      }
    }

    next();
  }
  catch (err)
  {
    next(err);
  }
}

async function validate(sequelizeModel: sequelize.ModelClass, model: CommonModel): Promise<void>
{
  const defaultScope = sequelizeModel.options.defaultScope;
  const publicWriteScope = sequelizeModel.options.scopes.publicWrite as Sequelize.FindOptions || defaultScope;

  if (publicWriteScope.attributes)
  {
    for (const attribute of Object.keys(model))
    {
      if (isExcluded(publicWriteScope, attribute))
      {
        delete model[attribute];
      }
    }
  }

  try
  {
    const dataModel = sequelizeModel.build(model);
    await dataModel.validate({ fields: publicWriteScope.attributes } as any);
  }
  catch (err)
  {
    if (err instanceof Sequelize.ValidationError)
    {
      let errors = (err as Sequelize.ValidationError).errors;

      if (sequelizeModel.options.scopes.publicAllowNull)
      {
        const allowNullScope = sequelizeModel.options.scopes.publicAllowNull as Sequelize.FindOptions;
        errors = errors.filter(error => error.type !== 'notNull Violation' || !isIncluded(allowNullScope, error.path));
      }

      if (!errors.length)
      {
        return;
      }

      err = new ValidationError(errors.map(error => error.message));
    }

    throw err;
  }
}
