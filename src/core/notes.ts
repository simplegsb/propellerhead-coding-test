import * as sequelize from '../data/sequelize';
import * as commonActions from './common-actions';
import { Note } from './models';

export const queryAttributes = [ 'text' ];
const sequelizeModel = sequelize.Note;

const common = commonActions.resolve<Note>(queryAttributes, sequelizeModel);
export const get = common.get;
export const getAll = common.getAll;
export const count = common.count;
export const create = common.create;
export const update = common.update;
export const destroy = common.destroy;
