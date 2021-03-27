import * as moment from 'moment';
import * as Sequelize from 'sequelize';

import * as sequelize from '../data/sequelize';
import { NotFoundError } from './errors';
import { SortOrder } from './models';

export function getFindOptions(sequelizeModel: sequelize.ModelClass,
                               include?: string[],
                               where?: Sequelize.WhereOptions): Sequelize.FindOptions
{
  let findOptions: Sequelize.FindOptions = { where };

  if (include)
  {
    const associatedModels = include
      .filter(includeElement => sequelizeModel.associations[includeElement])
      .map(includeElement => sequelizeModel.associations[includeElement].target);

    findOptions = { ...findOptions, include: associatedModels };
  }

  return findOptions;
}

export function getAllFindOptions(sequelizeModel: sequelize.ModelClass,
                                  page?: number,
                                  pageSize?: number,
                                  sort?: SortOrder[],
                                  filters?: { [key: string]: string | string[] },
                                  query?: string,
                                  queryAttributes?: string[],
                                  include?: string[],
                                  where?: Sequelize.WhereOptions): Sequelize.FindOptions
{
  let findOptions: Sequelize.FindOptions = { include: [], where: where || {} };

  if (Number.isInteger(page) && Number.isInteger(pageSize))
  {
    findOptions = { ...findOptions, offset: page * pageSize, limit: pageSize };
  }

  if (sort)
  {
    const sortArray: Sequelize.OrderItem[] = sort
      .filter(sortElement => sequelizeModel.rawAttributes[sortElement.attribute])
      .map(sortElement =>
      {
        if (sortElement.descending)
        {
          return [ sortElement.attribute, 'DESC' ];
        }

        return sortElement.attribute;
      });

    findOptions = { ...findOptions, order: sortArray };
  }

  if (filters)
  {
    for (const filterKey of Object.keys(filters))
    {
      if (filterKey.includes('.'))
      {
        const [ tableName, attributeName ] = filterKey.split('.');
        const modelName = Object.keys(sequelize).find(key =>
        {
          if (!sequelize[key].getTableName)
          {
            return false;
          }

          return sequelize[key].getTableName() === tableName;
        });

        if (!modelName)
        {
          continue;
        }

        const includeOptions: Sequelize.IncludeOptions =
        {
          model: sequelize[modelName],
          as: `${tableName}Filter`,
          where: {}
        };

        if (Array.isArray(filters[filterKey]))
        {
          includeOptions.where[attributeName] = { [Sequelize.Op.or]: filters[filterKey] };
        }
        else
        {
          includeOptions.where[attributeName] = filters[filterKey];
        }

        findOptions.include.push(includeOptions);
      }
      else
      {
        if (Array.isArray(filters[filterKey]))
        {
          findOptions.where[filterKey] = { [Sequelize.Op.or]: filters[filterKey] };
        }
        else
        {
          findOptions.where[filterKey] = filters[filterKey];
        }
      }
    }
  }

  if (query)
  {
    if (!findOptions.where[Sequelize.Op.or])
    {
      findOptions.where[Sequelize.Op.or] = [];
    }

    for (const queryAttribute of queryAttributes)
    {
      const tokens = query.trim().split(/\s+/);

      for (const token of tokens)
      {
        const likeClause: any = {};
        likeClause[queryAttribute] = { [Sequelize.Op.like]: '%' + token + '%' };

        findOptions.where[Sequelize.Op.or].push(likeClause);
      }
    }
  }

  if (include)
  {
    const associatedModels = include
      .filter(includeElement => sequelizeModel['associations'][includeElement])
      .map(includeElement => sequelizeModel['associations'][includeElement].target);

    for (const associatedModel of associatedModels)
    {
      findOptions.include.push(associatedModel);
    }
  }

  return findOptions;
}

export function toModel<ModelType>(dataModel: Sequelize.Model): ModelType
{
  if (!dataModel)
  {
    throw new NotFoundError();
  }

  const model = dataModel.get({ plain: true });

  prepareModel(model);

  return model as unknown as ModelType;
}

function prepareModel(model: any): void
{
  if (!model)
  {
    return;
  }

  for (const key of Object.keys(model))
  {
    const value = model[key];

    if (value instanceof Date)
    {
      model[key] = moment.utc(value);
    }
    else if (typeof value === 'object')
    {
      if (Array.isArray(value) && key.endsWith('Filter'))
      {
        delete model[key];
      }
      else
      {
        prepareModel(value);
      }
    }
  }
}
