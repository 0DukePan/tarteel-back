import { database } from "../config/database";
import { invoices, enrollments, parents } from "../db/schema";
import { IInvoice } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq, desc } from "drizzle-orm";

export class InvoiceService {
  private getDb() {
    return database.getDb();
  }

  async createInvoice(invoiceData: Omit<IInvoice, 'id' | 'issueDate' | 'createdAt' | 'updatedAt'>): Promise<IInvoice> {
    try {
      const db = this.getDb();

      // Validate parentId
      if (invoiceData.parentId) {
        const parentExists = await db.select().from(parents).where(eq(parents.id, invoiceData.parentId)).limit(1);
        if (parentExists.length === 0) {
          throw new AppError('Parent not found', 404);
        }
      }

      // Validate enrollmentId if provided
      if (invoiceData.enrollmentId) {
        const enrollmentExists = await db.select().from(enrollments).where(eq(enrollments.id, invoiceData.enrollmentId)).limit(1);
        if (enrollmentExists.length === 0) {
          throw new AppError('Enrollment not found', 404);
        }
      }

      const newInvoice = await db.insert(invoices).values(invoiceData as any).returning();
      logger.info(`New invoice created: ${newInvoice[0].id}`);
      return newInvoice[0] as IInvoice;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getInvoices(parentId?: string, enrollmentId?: string): Promise<IInvoice[]> {
    try {
      const db = this.getDb();

      let allInvoices;
      if (parentId) {
        allInvoices = await db.select().from(invoices).where(eq(invoices.parentId, parentId)).orderBy(desc(invoices.issueDate));
      } else if (enrollmentId) {
        allInvoices = await db.select().from(invoices).where(eq(invoices.enrollmentId, enrollmentId)).orderBy(desc(invoices.issueDate));
      } else {
        allInvoices = await db.select().from(invoices).orderBy(desc(invoices.issueDate));
      }
      return allInvoices as IInvoice[];
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id: string): Promise<IInvoice> {
    try {
      const db = this.getDb();
      const invoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);

      if (invoice.length === 0) {
        throw new AppError('Invoice not found', 404);
      }
      return invoice[0] as IInvoice;
    } catch (error) {
      logger.error(`Error fetching invoice with ID ${id}:`, error);
      throw error;
    }
  }

  async updateInvoice(id: string, updateData: Partial<Omit<IInvoice, 'id' | 'issueDate' | 'createdAt' | 'updatedAt'>>): Promise<IInvoice> {
    try {
      const db = this.getDb();

      const existingInvoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
      if (existingInvoice.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      // Validate parentId if provided
      if (updateData.parentId) {
        const parentExists = await db.select().from(parents).where(eq(parents.id, updateData.parentId)).limit(1);
        if (parentExists.length === 0) {
          throw new AppError('Parent not found', 404);
        }
      }

      // Validate enrollmentId if provided
      if (updateData.enrollmentId) {
        const enrollmentExists = await db.select().from(enrollments).where(eq(enrollments.id, updateData.enrollmentId)).limit(1);
        if (enrollmentExists.length === 0) {
          throw new AppError('Enrollment not found', 404);
        }
      }

      const updatedInvoice = await db.update(invoices).set({
        ...updateData as any,
        updatedAt: new Date(),
      }).where(eq(invoices.id, id)).returning();

      logger.info(`Invoice updated: ${id}`);
      return updatedInvoice[0] as IInvoice;
    } catch (error) {
      logger.error(`Error updating invoice with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingInvoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
      if (existingInvoice.length === 0) {
        throw new AppError('Invoice not found', 404);
      }

      await db.delete(invoices).where(eq(invoices.id, id));
      logger.info(`Invoice deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting invoice with ID ${id}:`, error);
      throw error;
    }
  }
}
