import * as express from 'express';

import { ValidationError } from '../core/errors';
import { Request, SortOrder } from '../core/models';
import { Param } from './open-api';

export function getAllQueryParams(filterAttributes: string[], queryAttributes: string[], includeModels: string[]): Param[]
{
  const queryParams: Param[] =
  [
    { name: 'page', description: 'The page to include in the response', type: 'number' },
    { name: 'pageSize', description: 'The number of results per page', type: 'number' },
    { name: 'sort', description: 'The attribute to sort by (prefix with "-" for a descending sort)', type: 'string' },
  ];

  if (filterAttributes && filterAttributes.length)
  {
    for (const filterAttribute of filterAttributes)
    {
      queryParams.push(
      {
        name: filterAttribute,
        description: `Filter by the value of the '${filterAttribute}' attribute (comma separated)`,
        type: 'string'
      });
    }
  }

  if (queryAttributes && queryAttributes.length)
  {
    queryParams.push(
    {
      name: 'q',
      description: `A free-text search of the following attributes: ${queryAttributes}`,
      type: 'string'
    });
  }

  if (includeModels && includeModels.length)
  {
    queryParams.push(getEmbedQueryParam(includeModels));
  }

  return queryParams;
}

export function getEmbedQueryParam(includeModels: string[]): Param
{
  const embedQueryParam: Param =
  {
    name: 'embed',
    description: `Embed related models within the response (comma separated). Possible models include: ${includeModels}`,
    type: 'string'
  };

  return embedQueryParam;
}

export function addPagingHeaders(req: Request, res: express.Response, count: number): void
{
  res.setHeader('X-Total-Count', count);

  if (!req.query.page || !req.query.pageSize)
  {
    return;
  }

  if (req.query.pageSize < 1)
  {
    throw new ValidationError([ '"pageSize" must be positive' ]);
  }

  const pageStart = req.query.page * req.query.pageSize;
  const pageEnd = pageStart + req.query.pageSize - 1;

  const links: string[] = [];
  links.push(getLink(req, 0, req.query.pageSize));

  if (pageStart > 0)
  {
    links.push(getLink(req, Math.floor((pageStart - 1) / req.query.pageSize), req.query.pageSize));
  }

  if (pageEnd < count - 1)
  {
    links.push(getLink(req, Math.floor((pageEnd + 1) / req.query.pageSize), req.query.pageSize));
  }

  links.push(getLink(req, Math.floor((count - 1) / req.query.pageSize), req.query.pageSize));

  res.setHeader('Link', links.join(', '));
}

export function getFilters(req: Request, filterAttributes: string[]): any
{
  const filters: string[] = [];

  for (const filterAttribute of filterAttributes)
  {
    if (filterAttribute in req.query)
    {
      if (req.query[filterAttribute].includes(','))
      {
        filters[filterAttribute] = req.query[filterAttribute].split(',');
      }
      else if (req.query[filterAttribute] === 'null')
      {
        filters[filterAttribute] = null;
      }
      else
      {
        filters[filterAttribute] = req.query[filterAttribute];
      }
    }
  }

  return filters;
}

export function toInclude(embed: string): string[]
{
  if (!embed)
  {
    return undefined;
  }

  return embed.split(',');
}

export function toSortOrder(sort: string): SortOrder[]
{
  if (!sort)
  {
    return undefined;
  }

  return sort
    .split(',')
    .map(sortElement =>
    {
      if (sortElement.startsWith('-'))
      {
        return { attribute: sortElement.substring(1), descending: true };
      }

      return { attribute: sortElement };
    });
}

function getLink(req: express.Request, page: number, pageSize: number): string
{
  const url = req.protocol + '://' + req.get('host') + req.path;

  return `<${url}?page=${page}&pageSize=${pageSize}>; rel="first"`;
}
