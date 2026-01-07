import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createPayment, deletePayment, getPaymentById, getPayments, updatePayment } from '../controllers/payment.controller';
import { createPaymentSchema, updatePaymentSchema } from '../validators/payment.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin', 'parent'), validate(createPaymentSchema), createPayment)
  .get(authenticate, authorize('admin', 'parent'), getPayments);

router.route('/:id')
  .get(authenticate, authorize('admin', 'parent'), getPaymentById)
  .put(authenticate, authorize('admin', 'parent'), validate(updatePaymentSchema), updatePayment)
  .delete(authenticate, authorize('admin'), deletePayment);

export default router;

