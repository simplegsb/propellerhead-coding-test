import * as express from 'express';
import { Moment } from 'moment';
import { Transaction } from 'sequelize';

export interface CommonModel
{
  id?: string;
  createdAt?: Moment;
  updatedAt?: Moment;
}

export interface Config
{
  environment: 'dev' | 'production' | 'test';
  databases: { [key: string]: string };
  version: string;
}

export interface Context
{
  transaction: Transaction;
}

export interface Customer extends CommonModel
{
  customerId?: string;
  status?: 'prospective' | 'current' | 'non-active';
  firstName: number;
  lastName: number;
  email: number;
  phone?: number;
  notes?: Note[];
}

export interface Note extends CommonModel
{
  text: string;
}

export interface Request extends express.Request
{
  context: Context;
  query: any;
}

export interface RolePermission
{
  roleId: string;
  permissionId: string;
  read: boolean;
  write: boolean;
  execute: boolean;
  createdAt?: Moment;
  updatedAt?: Moment;
}

export interface SortOrder
{
  attribute: string;
  descending?: boolean;
}
