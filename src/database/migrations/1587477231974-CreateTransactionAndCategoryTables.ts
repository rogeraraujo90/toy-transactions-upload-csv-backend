import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTransactionAndCategoryTables1587477231974
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const categoryTable = new Table({
      name: 'categories',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'title',
          type: 'varchar',
          isUnique: true,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'NOW()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'NOW()',
        },
      ],
    });

    const transactionTable = new Table({
      name: 'transactions',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'title',
          type: 'varchar',
        },
        {
          name: 'value',
          type: 'numeric',
        },
        {
          name: 'type',
          type: 'varchar',
        },
        {
          name: 'category_id',
          type: 'uuid',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'NOW()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'NOW()',
        },
      ],
      foreignKeys: [
        {
          name: 'FK_TRANSACTION_CATEGORY',
          columnNames: ['category_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
      ],
    });

    await queryRunner.createTable(categoryTable, true);
    await queryRunner.createTable(transactionTable, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'FK_TRANSACTION_CATEGORY');
    await queryRunner.dropTable('transactions');
    await queryRunner.dropTable('categories');
  }
}
