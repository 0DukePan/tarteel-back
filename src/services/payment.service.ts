import { database } from "../config/database";
import { payments, enrollments } from "../db/schema";
import { IPayment } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq, desc } from "drizzle-orm";

export class PaymentService {
  private getDb() {
    return database.getDb();
  }

  async createPayment(paymentData: Omit<IPayment, 'id' | 'paymentDate' | 'createdAt' | 'updatedAt'>): Promise<IPayment> {
    try {
      const db = this.getDb();

      // Validate enrollmentId
      if (paymentData.enrollmentId) {
        const enrollmentExists = await db.select().from(enrollments).where(eq(enrollments.id, paymentData.enrollmentId)).limit(1);
        if (enrollmentExists.length === 0) {
          throw new AppError('Enrollment not found', 404);
        }
      }

      const newPayment = await db.insert(payments).values(paymentData as any).returning();
      logger.info(`New payment created: ${newPayment[0].id}`);
      return newPayment[0] as IPayment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPayments(enrollmentId?: string): Promise<IPayment[]> {
    try {
      const db = this.getDb();
      const allPayments = enrollmentId
        ? await db.select().from(payments).where(eq(payments.enrollmentId, enrollmentId)).orderBy(desc(payments.paymentDate))
        : await db.select().from(payments).orderBy(desc(payments.paymentDate));
      return allPayments as IPayment[];
    } catch (error) {
      logger.error('Error fetching payments:', error);
      throw error;
    }
  }

  async getPaymentById(id: string): Promise<IPayment> {
    try {
      const db = this.getDb();
      const payment = await db.select().from(payments).where(eq(payments.id, id)).limit(1);

      if (payment.length === 0) {
        throw new AppError('Payment not found', 404);
      }
      return payment[0] as IPayment;
    } catch (error) {
      logger.error(`Error fetching payment with ID ${id}:`, error);
      throw error;
    }
  }

  async updatePayment(id: string, updateData: Partial<Omit<IPayment, 'id' | 'paymentDate' | 'createdAt' | 'updatedAt'>>): Promise<IPayment> {
    try {
      const db = this.getDb();

      const existingPayment = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
      if (existingPayment.length === 0) {
        throw new AppError('Payment not found', 404);
      }

      // Validate enrollmentId if provided
      if (updateData.enrollmentId) {
        const enrollmentExists = await db.select().from(enrollments).where(eq(enrollments.id, updateData.enrollmentId)).limit(1);
        if (enrollmentExists.length === 0) {
          throw new AppError('Enrollment not found', 404);
        }
      }

      const updatedPayment = await db.update(payments).set({
        ...updateData as any,
        updatedAt: new Date(),
      }).where(eq(payments.id, id)).returning();

      logger.info(`Payment updated: ${id}`);
      return updatedPayment[0] as IPayment;
    } catch (error) {
      logger.error(`Error updating payment with ID ${id}:`, error);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingPayment = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
      if (existingPayment.length === 0) {
        throw new AppError('Payment not found', 404);
      }

      await db.delete(payments).where(eq(payments.id, id));
      logger.info(`Payment deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting payment with ID ${id}:`, error);
      throw error;
    }
  }
}
