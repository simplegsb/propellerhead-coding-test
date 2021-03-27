import * as fs from 'fs';
import * as express from 'express';

import config from '../../core/config';
import * as sequelize from '../../data/sequelize';
import * as Schema from './schema';
import { buildArraySchema, buildObjectSchema } from './sequelize';

// TODO Test all endpoint documentation

export type Method = 'delete' | 'get' | 'patch' | 'post' | 'put';

export interface RequestMetaData
{
  bodyType?: string;
  params?: Param[];
  queryParams?: Param[];
  contentTypes?: ('application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data')[];
  files?: { type: 'single', required?: boolean };
}
export interface Param { name: string; description: string; type: 'boolean' | 'number' | 'string'; }

export type ResponseMetaData = NonEmptyResponseMetaData | EmptyResponseMetaData;
export interface NonEmptyResponseMetaData { code: '200' | '201'; type: string; }
export interface EmptyResponseMetaData { code: '204'; }

type SecurityMethod = 'medium-cookie' | 'oauth';

const definition = JSON.parse(fs.readFileSync('assets/open-api.json', 'utf8')) as Schema.OpenAPI;
export default definition;

definition.info.version = config.version;

if (!definition.paths)
{
  definition.paths = {};
}

if (!definition.components)
{
  definition.components = {};
}

if (!definition.components.schemas)
{
  definition.components.schemas = {};
}

if (!definition.tags)
{
  definition.tags = [];
}

export function register(tag: string,
                         method: Method,
                         path: string,
                         description: string,
                         security: SecurityMethod,
                         requestMetaData: RequestMetaData,
                         responseMetaData: ResponseMetaData):
  (req: express.Request, res: express.Response, next: express.NextFunction) => void
{
  const openApiPath = path.replace(/:(\w+)/g, '{$1}');
  if (!definition.paths[openApiPath])
  {
    definition.paths[openApiPath] = {};
  }

  definition.paths[openApiPath][method] = buildOperation(tag, method, path, description, security, requestMetaData, responseMetaData);

  if (!definition.tags.find(theTag => theTag.name === tag))
  {
    definition.tags.push({ name: tag });
    definition.tags.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (req: express.Request, res: express.Response, next: express.NextFunction) =>
  {
    if (requestMetaData.params)
    {
      for (const paramKey of Object.keys(req.params))
      {
        convertParam(req.params, paramKey, requestMetaData.params);
      }
    }

    if (requestMetaData.queryParams)
    {
      for (const queryKey of Object.keys(req.query))
      {
        convertParam(req.query, queryKey, requestMetaData.queryParams);
      }
    }

    res.status(Number(responseMetaData.code));

    next();
  };
}

function buildOperation(tag: string,
                        method: Method,
                        path: string,
                        description: string,
                        security: SecurityMethod,
                        requestMetaData: RequestMetaData,
                        responseMetaData: ResponseMetaData): Schema.Operation
{
  const operation: Schema.Operation =
  {
    tags: [ tag ],
    description,
    parameters: [],
    responses:
    {
      [responseMetaData.code]: buildResponse(method, path, responseMetaData),
      '400': { $ref: '#/components/responses/400' }
    },
  };

  if (requestMetaData.bodyType)
  {
    operation.requestBody = buildRequestBody(method, path, requestMetaData);
  }

  if (requestMetaData.params)
  {
    for (const param of requestMetaData.params)
    {
      operation.parameters.push(
      {
        name: param.name,
        in: 'path',
        description: param.description,
        required: true,
        schema: { type: param.type }
      });
    }
  }

  if (requestMetaData.queryParams)
  {
    for (const queryParam of requestMetaData.queryParams)
    {
      operation.parameters.push(
      {
        name: queryParam.name,
        in: 'query',
        description: queryParam.description,
        schema: { type: queryParam.type }
      });
    }
  }

  if (security === 'medium-cookie')
  {
    operation.security = [ { 'Medium Cookie': [] } ];
    operation.responses['401'] = { $ref: '#/components/responses/401' };
  }
  else if (security === 'oauth')
  {
    operation.security = [ { OAuth: [ 'default' ] } ];
    operation.responses['401'] = { $ref: '#/components/responses/401' };
    operation.responses['403'] = { $ref: '#/components/responses/403' };
  }

  return operation;
}

function buildRequestBody(method: Method, path: string, requestMetaData: RequestMetaData): Schema.RequestBody
{
  if (!requestMetaData.bodyType)
  {
    return undefined;
  }

  const requestBody: Schema.RequestBody =
  {
    content: {},
    required: true
  };

  if (!requestMetaData.contentTypes)
  {
    requestMetaData.contentTypes = [ 'application/json' ];
  }

  for (const contentType of requestMetaData.contentTypes)
  {
    const ref = `#/components/schemas/${requestMetaData.bodyType}`;
    let withFile: boolean;
    let fileRequired: boolean;
    if (contentType === 'multipart/form-data' && requestMetaData.files && requestMetaData.files.type === 'single')
    {
      withFile = true;
      fileRequired = requestMetaData.files.required;
    }

    addComponentIfNotExisting(ref, withFile, fileRequired);

    requestBody.content[contentType] =
    {
      schema:
      {
        $ref: ref
      }
    };
  }

  return requestBody;
}

function buildResponse(method: Method, path: string, responseMetaData: ResponseMetaData): Schema.Response
{
  if (!responseMetaData || (responseMetaData.code !== '204' && !responseMetaData.type))
  {
    throw new Error(`Response type not defined for ${method} ${path}`);
  }

  const response: Schema.Response = { description: '' };
  if (responseMetaData.code !== '204')
  {
    if (responseMetaData.type === 'string')
    {
      response.content =
      {
        'text/plain':
        {
          schema:
          {
            type: 'string'
          }
        }
      };
    }
    else if (responseMetaData.type === 'string[]')
    {
      response.content =
        {
          'text/plain':
            {
              schema:
              {
                type: 'array',
                items:
                {
                  type: 'string'
                }
              }
            }
        };
    }
    else
    {
      const ref = `#/components/schemas/${responseMetaData.type}`;

      response.content =
      {
        'application/json':
        {
          schema:
          {
            $ref: ref
          }
        }
      };

      addComponentIfNotExisting(ref);
    }
  }

  return response;
}

function convertParam(reqObj: any, name: string, params: Param[]): void
{
  const param = params.find(theParam => theParam.name === name);
  if (param)
  {
    if (param.type === 'boolean')
    {
      reqObj[name] = reqObj[name] === 'true';
    }
    else if (param.type === 'number')
    {
      reqObj[name] = Number(reqObj[name]);
    }
  }
}

function addComponentIfNotExisting(ref: string, withFile?: boolean, fileRequired?: boolean): void
{
  const componentName = ref.substring(ref.lastIndexOf('/') + 1);
  const modelNameExtended = componentName[0].toUpperCase() + componentName.substring(1);
  const modelName = modelNameExtended.replace('[]', '');

  if (definition.components.schemas[modelName])
  {
    return;
  }

  const model = sequelize[modelName] as sequelize.ModelClass;
  if (!model)
  {
    return;
  }

  if (componentName.endsWith('[]'))
  {
    definition.components.schemas[componentName] = buildArraySchema(model);
  }
  else
  {
    const schema = buildObjectSchema(model);
    definition.components.schemas[componentName] = schema;

    if (withFile)
    {
      schema.properties.file =
      {
        type: 'string',
        format: 'binary',
        required: fileRequired
      };
    }
  }
}
