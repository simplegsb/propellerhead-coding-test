import * as Sequelize from 'sequelize';

import config from '../core/config';

export type ModelClass = { new (): Sequelize.Model } & typeof Sequelize.Model;

export const sequelize = new Sequelize.Sequelize(config.databases.default,
{
  define:
  {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  logging: false,
  pool:
  {
    max: 25
  }
});

const phoneRegex = /^[0-9 ]+$/;
export const statuses = [ 'prospective', 'current', 'non-active' ];

export class Customer extends Sequelize.Model {}
Customer.init(
  {
    id:
    {
      type: Sequelize.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: Sequelize.UUIDV4
    },
    status:
    {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'prospective',
      validate:
      {
        isIn: { args: [ statuses ], msg: `customer.status must be one of: ${statuses}` }
      }
    },
    firstName:
    {
      type: Sequelize.STRING,
      allowNull: false,
      validate:
      {
        notEmpty: { msg: 'customer.firstName cannot be empty' }
      }
    },
    lastName:
    {
      type: Sequelize.STRING,
      allowNull: false,
      validate:
      {
        notEmpty: { msg: 'customer.lastName cannot be empty' }
      }
    },
    email:
    {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate:
      {
        isEmail: { msg: 'customer.email must be a valid email' }
      }
    },
    phone:
    {
      type: Sequelize.STRING,
      validate:
      {
        is: { args: phoneRegex, msg: 'customer.phone must contain only numbers and spaces' }
      }
    }
  },
  {
    sequelize,
    modelName: 'customer'
  }
);

export class Note extends Sequelize.Model {}
Note.init(
  {
    id:
    {
      type: Sequelize.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: Sequelize.UUIDV4
    },
    text:
    {
      type: Sequelize.STRING,
      allowNull: false,
      validate:
      {
        notEmpty: { msg: 'note.text cannot be empty' }
      }
    }
  },
  {
    sequelize,
    modelName: 'note'
  }
);

// Associations are duplicated with *Filter aliases to support including and filtering by an association at the same time

Customer.hasMany(Note, { foreignKey: 'customerId' });
Customer.hasMany(Note, { foreignKey: 'customerId', as: 'notesFilter' });
