import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(transactionId: string): Promise<void> {
    if (!transactionId) {
      throw new AppError('An ID must be provided.');
    }

    const transactionRepository = getRepository(Transaction);
    const transaction = await transactionRepository
      .findOne(transactionId)
      .catch(() => undefined);

    if (!transaction) {
      throw new AppError('Unexistent transaction');
    }

    await transactionRepository.remove([transaction]);
  }
}

export default DeleteTransactionService;
