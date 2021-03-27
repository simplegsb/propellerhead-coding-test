import * as Sequelize from 'sequelize';

export async function up(queryInterface: Sequelize.QueryInterface): Promise<void>
{
  await queryInterface.createTable('customers',
  {
    id: { type: Sequelize.UUID, primaryKey: true, unique: true, defaultValue: Sequelize.UUIDV4 },
    status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'prospective' },
    firstName: { type: Sequelize.STRING, allowNull: false },
    lastName: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, unique: true, allowNull: false },
    phone: { type: Sequelize.STRING },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false }
  },
  {
    charset: 'utf8',
      collate: 'utf8_general_ci'
  } as any);

  await queryInterface.createTable('notes',
  {
    id: { type: Sequelize.UUID, primaryKey: true, unique: true, defaultValue: Sequelize.UUIDV4 },
    text: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    customerId: { type: Sequelize.UUID, allowNull: false,
      references: { model: 'customers', key: 'id' }, onUpdate: 'cascade' }
  },
  {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  } as any);
}

export async function down(queryInterface: Sequelize.QueryInterface): Promise<void>
{
  await queryInterface.dropTable('customers');
  await queryInterface.dropTable('notes');
}
