import * as express from 'express';

import * as customers from '../core/customers';
import { Customer, Request } from '../core/models';
import validation from './middleware/validation';
import transaction from './middleware/transaction';
import * as openApi from './open-api';
import { addPagingHeaders, getAllQueryParams, toInclude, toSortOrder } from './util';

const tag = 'Customers';
const middleware = [ validation, transaction ];

export default function(app: express.Express): void
{
  app.get(
    '/customers',
    openApi.register(
      tag,
      'get',
      '/customers',
      'Retrieves Customers',
      undefined,
      {
        queryParams: getAllQueryParams(undefined, customers.queryAttributes, customers.includeModels)
      },
      { code: '200', type: 'customer[]' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      addPagingHeaders(req, res, await customers.count(req.context, undefined, req.query.q));

      res.send(await customers.getAll(
        req.context,
        req.query.page,
        req.query.pageSize,
        toSortOrder(req.query.sort),
        undefined,
        req.query.q,
        toInclude(req.query.embed)
      ));
    }
  );

  app.post(
    '/customers',
    openApi.register(
      tag,
      'post',
      '/customers',
      'Creates a Customer',
      undefined,
      { bodyType: 'customer' },
      { code: '201', type: 'customer' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      const theCustomer = req.body as Customer;

      res.send(await customers.create(req.context, theCustomer));
    }
  );

  app.get(
    '/customers/:customerId',
    openApi.register(
      tag,
      'get',
      '/customers/:customerId',
      'Retrieves a Customer',
      undefined,
      {
        params: [ { name: 'customerId', description: 'The ID of the Customer', type: 'string' } ]
      },
      { code: '200', type: 'customer' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      res.send(await customers.get(req.context, req.params.customerId, toInclude(req.query.embed)));
    }
  );

  app.put(
    '/customers/:customerId',
    openApi.register(
      tag,
      'put',
      '/customers/:customerId',
      'Updates a Customer',
      undefined,
      {
        params: [ { name: 'customerId', description: 'The ID of the Customer', type: 'string' } ],
        bodyType: 'customer',
      },
      { code: '200', type: 'customer' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      const theCustomer = req.body as Customer;
      theCustomer.id = req.params.customerId;

      res.send(await customers.update(req.context, theCustomer, toInclude(req.query.embed)));
    }
  );

  app.delete(
    '/customers/:customerId',
    openApi.register(
      tag,
      'delete',
      '/customers/:customerId',
      'Deletes a Customer',
      undefined,
      {
        params: [ { name: 'customerId', description: 'The ID of the Customer', type: 'string' } ]
      },
      { code: '204' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      await customers.destroy(req.context, req.params.customerId);
      res.end();
    }
  );
}
