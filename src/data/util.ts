import * as Sequelize from 'sequelize';

export function isIncluded(findOptions: Sequelize.FindOptions, attributeKey: string): boolean
{
  if (!findOptions)
  {
    return false;
  }

  if (!findOptions.attributes)
  {
    return false;
  }

  if (Array.isArray(findOptions.attributes))
  {
    return findOptions.attributes.indexOf(attributeKey) !== -1;
  }

  const attributesWithInclude = findOptions.attributes as { include: string[] };

  if (!attributesWithInclude.include)
  {
    return false;
  }

  return attributesWithInclude.include.indexOf(attributeKey) !== -1;
}

export function isExcluded(findOptions: Sequelize.FindOptions, attributeKey: string): boolean
{
  if (!findOptions)
  {
    return false;
  }

  if (!findOptions.attributes)
  {
    return false;
  }

  const attributesWithExclude = findOptions.attributes as { exclude: string[] };

  if (!attributesWithExclude.exclude)
  {
    return false;
  }

  return attributesWithExclude.exclude.indexOf(attributeKey) !== -1;
}
