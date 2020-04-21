import csv from 'csv-parse';
import fs from 'fs';

import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const csvParser = csv({ from_line: 2 });
    const fileReadStreamer = fs.createReadStream(filePath);
    const parsedCsv = fileReadStreamer.pipe(csvParser);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    parsedCsv.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parsedCsv.on('end', resolve));

    const categoryRepository = getRepository(Category);
    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });
    const existentCategoriesNames = existentCategories.map(
      existentCategory => existentCategory.title,
    );

    const toCreateCategories: string[] = [];
    const newCategories: Category[] = [];

    categories.forEach(category => {
      if (
        !existentCategoriesNames.includes(category) &&
        !toCreateCategories.includes(category)
      ) {
        toCreateCategories.push(category);
        newCategories.push(categoryRepository.create({ title: category }));
      }
    });

    await categoryRepository.save(newCategories);

    const allCategories = [...existentCategories, ...newCategories];
    const categoriesByName: Record<string, Category> = {};

    allCategories.forEach(dbCategory => {
      categoriesByName[dbCategory.title] = dbCategory;
    });

    const transactionRepository = getRepository(Transaction);
    const newTransactions: Transaction[] = [];

    transactions.forEach(transaction => {
      newTransactions.push(
        transactionRepository.create({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: categoriesByName[transaction.category],
        }),
      );
    });

    await transactionRepository.save(newTransactions);
    await fs.promises.unlink(filePath);

    return newTransactions;
  }
}

export default ImportTransactionsService;
