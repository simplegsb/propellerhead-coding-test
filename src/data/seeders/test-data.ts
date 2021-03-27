import * as Sequelize from 'sequelize';
import * as uuid from 'uuid';

export async function up(queryInterface: Sequelize.QueryInterface): Promise<void>
{
  const gyanId = uuid.v4();
  const elonId = uuid.v4();

  await queryInterface.bulkInsert('customers',
  [
    {
      id: gyanId,
      status: 'current',
      firstName: 'Prem',
      lastName: 'Gyan',
      email: 'gyan@intectum.nz',
      phone: '111',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: elonId,
      status: 'prospective',
      firstName: 'Elon',
      lastName: 'Musk',
      email: 'elon@intectum.nz',
      phone: '555 0001',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  await queryInterface.bulkInsert('notes',
  [
    {
      id: uuid.v4(),
      text: 'He\'s a pretty smart guy',
      customerId: elonId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
}
