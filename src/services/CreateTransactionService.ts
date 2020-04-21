import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!title || !value || !type || !category) {
      throw new AppError('Missing required fields.');
    }

    if (value < 0) {
      throw new AppError('Value cannot be negative.');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Unexpected value for type field.');
    }

    const transactionRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient funds');
    }

    const categoryRepository = getRepository(Category);
    let dbCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!dbCategory) {
      dbCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(dbCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: dbCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
