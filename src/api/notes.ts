import * as express from 'express';

import { Note, Request } from '../core/models';
import * as notes from '../core/notes';
import validation from './middleware/validation';
import transaction from './middleware/transaction';
import * as openApi from './open-api';
import { addPagingHeaders, getAllQueryParams, getFilters, toSortOrder } from './util';

const tag = 'Notes';
const middleware = [ validation, transaction ];
const filterAttributes = [ 'customerId' ];

export default function(app: express.Express): void
{
  app.get(
    '/notes',
    openApi.register(
      tag,
      'get',
      '/notes',
      'Retrieves Notes',
      undefined,
      {
        queryParams: getAllQueryParams(filterAttributes, notes.queryAttributes, undefined)
      },
      { code: '200', type: 'note[]' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      addPagingHeaders(req, res, await notes.count(req.context, getFilters(req, filterAttributes), req.query.q));

      res.send(await notes.getAll(
        req.context,
        req.query.page,
        req.query.pageSize,
        toSortOrder(req.query.sort),
        getFilters(req, filterAttributes),
        req.query.q
      ));
    }
  );

  app.post(
    '/notes',
    openApi.register(
      tag,
      'post',
      '/notes',
      'Creates a Note',
      undefined,
      { bodyType: 'note' },
      { code: '201', type: 'note' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      const theNote = req.body as Note;

      res.send(await notes.create(req.context, theNote));
    }
  );

  app.get(
    '/notes/:noteId',
    openApi.register(
      tag,
      'get',
      '/notes/:noteId',
      'Retrieves a Note',
      undefined,
      {
        params: [ { name: 'noteId', description: 'The ID of the Note', type: 'string' } ]
      },
      { code: '200', type: 'note' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      res.send(await notes.get(req.context, req.params.noteId));
    }
  );

  app.put(
    '/notes/:noteId',
    openApi.register(
      tag,
      'put',
      '/notes/:noteId',
      'Updates a Note',
      undefined,
      {
        params: [ { name: 'noteId', description: 'The ID of the Note', type: 'string' } ],
        bodyType: 'note',
      },
      { code: '200', type: 'note' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      const theNote = req.body as Note;
      theNote.id = req.params.noteId;

      res.send(await notes.update(req.context, theNote));
    }
  );

  app.delete(
    '/notes/:noteId',
    openApi.register(
      tag,
      'delete',
      '/notes/:noteId',
      'Deletes a Note',
      undefined,
      {
        params: [ { name: 'noteId', description: 'The ID of the Note', type: 'string' } ]
      },
      { code: '204' }
    ),
    ...middleware,
    async (req: Request, res: express.Response) =>
    {
      await notes.destroy(req.context, req.params.noteId);
      res.end();
    }
  );
}
