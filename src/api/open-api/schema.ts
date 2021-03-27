export interface OpenAPI
{
  openapi: '3.0.0';
  info: Info;
  servers?: Server[];
  paths: Paths;
  components?: Components;
  security?: SecurityRequirement[];
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
}

export interface Info
{
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: Licence;
  version: string;
}

export interface Contact
{
  name?: string;
  url?: string;
  email?: string;
}

export interface Licence
{
  name: string;
  url?: string;
}

export interface Server
{
  url: string;
  description?: string;
  variables?: { [key: string]: ServerVariable };
}

export interface ServerVariable
{
  enum?: string[];
  default: string;
  description?: string;
}

export interface Components
{
  schemas?: { [key: string]: Schema | Reference };
  responses?: { [key: string]: Response | Reference };
  parameters?: { [key: string]: Parameter | Reference };
  examples?: { [key: string]: Example | Reference };
  requestBodies?: { [key: string]: RequestBody | Reference };
  headers?: { [key: string]: Header | Reference };
  securitySchemes?: { [key: string]: SecurityScheme | Reference };
  links?: { [key: string]: Link | Reference };
  callbacks?: { [key: string]: Callback | Reference };
}

export interface Paths
{
  [key: string]: PathItem;
}

export interface PathItem
{
  $ref?: string;
  summary?: string;
  description?: string;
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  trace?: Operation;
  servers?: Server[];
  parameters?: (Parameter | Reference)[];
}

export interface Operation
{
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses?: Responses;
  callbacks?: { [key: string]: Callback | Reference };
  deprecated?: boolean;
  security?: SecurityRequirement[];
  servers?: Server[];
}

export interface ExternalDocumentation
{
  description?: string;
  url: string;
}

export type Parameter =
  QueryParameter & WithContext | QueryParameter & WithSchema |
  PathParameter & WithContext | PathParameter & WithSchema |
  HeaderParameter & WithContext | HeaderParameter & WithSchema |
  CookieParameter & WithContext | CookieParameter & WithSchema;

interface BaseParameter
{
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  example?: any;
  examples?: { [key: string]: Example | Reference };
}

interface QueryParameter extends BaseParameter
{
  in: 'query';
  form?: boolean | number | string | any[] | Object;
  spaceDelimited?: any[];
  pipeDelimited?: any[];
  deepObject?: Object;
}

interface PathParameter extends BaseParameter
{
  in: 'path';
  required: true;
  matrix?: boolean | number | string | any[] | Object;
  label?: boolean | number | string | any[] | Object;
  simple?: any[];
}

interface HeaderParameter extends BaseParameter
{
  in: 'header';
  simple?: any[];
}

interface CookieParameter extends BaseParameter
{
  in: 'cookie';
  form?: boolean | number | string | any[] | Object;
}

export interface RequestBody
{
  description?: string;
  content: { [key: string]: MediaType };
  required?: boolean;
}

export interface MediaType
{
  schema?: Schema | Reference;
  example?: any;
  examples?: { [key: string]: Example | Reference };
  encoding?: { [key: string]: Encoding };
}

export interface Encoding
{
  contentType?: string;
  headers?: { [key: string]: Header | Reference };
  style?: string;
  exploded?: boolean;
  allowReserved?: boolean;
}

export interface Responses
{
  default?: Response | Reference;
  [HTTPStatusCode: string]: Response | Reference;
}

export interface Response
{
  description: string;
  headers?: { [key: string]: Header | Reference };
  content?: { [key: string]: MediaType };
  links?: { [key: string]: Link | Reference };
}

export interface Callback
{
  [key: string]: PathItem;
}

export type Example = ValueExample | ExternalValueExample;

interface BaseExample
{
  summary?: string;
  description?: string;
}

interface ValueExample extends BaseExample
{
  value: any;
}

interface ExternalValueExample extends BaseExample
{
  externalValue: string;
}

export type Link = RefLink | IdLink;

interface BaseLink
{
  parameters?: { [key: string]: any };
  requestBody?: any;
  description?: string;
  server?: Server;
}

interface RefLink extends BaseLink
{
  operationRef: any;
}

interface IdLink extends BaseLink
{
  operationId: string;
}

export type Header = HeaderBase & WithContext | HeaderBase & WithSchema;

interface HeaderBase
{
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  example?: any;
  examples?: { [key: string]: Example | Reference };
  simple?: any[];
}

export interface Tag
{
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
}

export interface Reference
{
  $ref: string;
}

export interface Schema
{
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: boolean;
  enum?: string[];
  type?: 'array' | 'boolean' | 'number' | 'null' | 'object' | 'string';
  allOf?: (Schema | Reference)[];
  oneOf?: (Schema | Reference)[];
  anyOf?: (Schema | Reference)[];
  not?: Schema | Reference;
  items?: Schema | Reference;
  properties?: { [key: string]: (Schema | Reference) };
  additionalProperties?: boolean | Object | { [key: string]: (Schema | Reference) };
  description?: string;
  format?: string;
  default?: any;
  nullable?: boolean;
  discriminator?: Discriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XML;
  externalDocs?: ExternalDocumentation;
  example?: any;
  deprecated?: boolean;
}

export interface Discriminator
{
  propertyName: string;
  mapping?: { [key: string]: string };
}

export interface XML
{
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export type SecurityScheme =
  ApiKeySecurityScheme | HttpSecurityScheme | HttpBearerSecurityScheme | OAuth2SecurityScheme | OpenIdConnectSecurityScheme;

interface BaseSecurityScheme
{
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
}

interface ApiKeySecurityScheme extends BaseSecurityScheme
{
  type: 'apiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';
}

interface HttpSecurityScheme extends BaseSecurityScheme
{
  type: 'http';
  scheme: string;
}

interface HttpBearerSecurityScheme extends BaseSecurityScheme
{
  scheme: 'bearer';
  bearerFormat?: string;
}

interface OAuth2SecurityScheme extends BaseSecurityScheme
{
  type: 'oauth2';
  flows: OAuthFlows;
}

interface OpenIdConnectSecurityScheme extends BaseSecurityScheme
{
  type: 'openIdConnect';
  openIdConnectUrl: string;
}

export interface OAuthFlows
{
  implicit?: ImplicitOAuthFlow;
  password?: PasswordOAuthFlow;
  clientCredentials?: ClientCredentialsOAuthFlow;
  authorizationCode?: AuthorizationCodeOAuthFlow;
}

interface OAuthFlow
{
  refreshUrl?: string;
  scopes: { [key: string]: string };
}

export interface ImplicitOAuthFlow extends OAuthFlow
{
  authorizationUrl: string;
}

export interface PasswordOAuthFlow extends OAuthFlow
{
  tokenUrl: string;
}

export interface ClientCredentialsOAuthFlow extends OAuthFlow
{
  tokenUrl: string;
}

export interface AuthorizationCodeOAuthFlow extends OAuthFlow
{
  authorizationUrl: string;
  tokenUrl: string;
}

export interface SecurityRequirement
{
  [key: string]: string[];
}

interface WithContext
{
  content?: { [key: string]: MediaType };
}

interface WithSchema
{
  schema?: Schema | Reference;
}
