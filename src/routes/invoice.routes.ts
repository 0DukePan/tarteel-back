import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createInvoice, deleteInvoice, getInvoiceById, getInvoices, updateInvoice } from '../controllers/invoice.controller';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoice.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin', 'parent'), validate(createInvoiceSchema), createInvoice)
  .get(authenticate, authorize('admin', 'parent'), getInvoices);

router.route('/:id')
  .get(authenticate, authorize('admin', 'parent'), getInvoiceById)
  .put(authenticate, authorize('admin'), validate(updateInvoiceSchema), updateInvoice)
  .delete(authenticate, authorize('admin'), deleteInvoice);

export default router;

