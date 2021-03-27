import * as sequelize from '../data/sequelize';
import * as commonActions from './common-actions';
import { Customer } from './models';

export const queryAttributes = [ 'email', 'firstName', 'lastName' ];
export const includeModels = [ 'notes' ];
const sequelizeModel = sequelize.Customer;

const common = commonActions.resolve<Customer>(queryAttributes, sequelizeModel);
export const get = common.get;
export const getAll = common.getAll;
export const count = common.count;
export const create = common.create;
export const update = common.update;
export const destroy = common.destroy;
