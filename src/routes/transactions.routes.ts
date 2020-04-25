import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer({ dest: 'tmp/' });

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json({
    id: transaction.id,
    title: transaction.title,
    value: transaction.value,
    type: transaction.type,
    category: transaction.category.title,
  });
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(request.params.id);
  return response.status(204).send();
});

const fileUpload = upload.single('file');
transactionsRouter.post('/import', fileUpload, async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();
  const transactions = await importTransactionsService.execute(
    request.file.path,
  );
  return response.status(201).json(transactions);
});

export default transactionsRouter;
