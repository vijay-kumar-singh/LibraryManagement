import {
  users,
  books,
  reservations,
  fines,
  payments,
  type User,
  type UpsertUser,
  type Book,
  type InsertBook,
  type Reservation,
  type InsertReservation,
  type Fine,
  type InsertFine,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;

  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, updates: Partial<Book>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  searchBooks(query: string, filters?: {
    genre?: string;
    author?: string;
    availability?: string;
    yearFrom?: number;
    yearTo?: number;
  }): Promise<Book[]>;
  updateBookAvailability(id: number, available: number): Promise<Book>;

  // Reservation operations
  getUserReservations(userId: string): Promise<(Reservation & { book: Book })[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, updates: Partial<Reservation>): Promise<Reservation>;
  getActiveReservations(): Promise<(Reservation & { user: User; book: Book })[]>;
  getOverdueReservations(): Promise<(Reservation & { user: User; book: Book })[]>;

  // Fine operations
  getUserFines(userId: string): Promise<Fine[]>;
  createFine(fine: InsertFine): Promise<Fine>;
  updateFine(id: number, updates: Partial<Fine>): Promise<Fine>;
  getTotalFines(userId: string): Promise<number>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment>;
  getUserPayments(userId: string): Promise<Payment[]>;

  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    activeReservations: number;
    availableBooks: number;
    dueSoon: number;
    outstandingFines: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const updateData: any = { stripeCustomerId: customerId, updatedAt: new Date() };
    if (subscriptionId) {
      updateData.stripeSubscriptionId = subscriptionId;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book> {
    const [book] = await db
      .update(books)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return book;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async searchBooks(query: string, filters?: {
    genre?: string;
    author?: string;
    availability?: string;
    yearFrom?: number;
    yearTo?: number;
  }): Promise<Book[]> {
    let queryBuilder = db.select().from(books);
    
    const conditions = [];
    
    if (query) {
      conditions.push(
        sql`(${books.title} ILIKE ${`%${query}%`} OR ${books.author} ILIKE ${`%${query}%`} OR ${books.isbn} ILIKE ${`%${query}%`})`
      );
    }
    
    if (filters?.genre) {
      conditions.push(eq(books.genre, filters.genre));
    }
    
    if (filters?.author) {
      conditions.push(ilike(books.author, `%${filters.author}%`));
    }
    
    if (filters?.availability === "available") {
      conditions.push(sql`${books.availableCopies} > 0`);
    } else if (filters?.availability === "unavailable") {
      conditions.push(sql`${books.availableCopies} = 0`);
    }
    
    if (filters?.yearFrom) {
      conditions.push(gte(books.publicationYear, filters.yearFrom));
    }
    
    if (filters?.yearTo) {
      conditions.push(lte(books.publicationYear, filters.yearTo));
    }
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    return await queryBuilder.orderBy(desc(books.createdAt));
  }

  async updateBookAvailability(id: number, available: number): Promise<Book> {
    const [book] = await db
      .update(books)
      .set({ availableCopies: available, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return book;
  }

  // Reservation operations
  async getUserReservations(userId: string): Promise<(Reservation & { book: Book })[]> {
    return await db
      .select()
      .from(reservations)
      .innerJoin(books, eq(reservations.bookId, books.id))
      .where(eq(reservations.userId, userId))
      .orderBy(desc(reservations.reservedAt));
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }

  async updateReservation(id: number, updates: Partial<Reservation>): Promise<Reservation> {
    const [reservation] = await db
      .update(reservations)
      .set(updates)
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }

  async getActiveReservations(): Promise<(Reservation & { user: User; book: Book })[]> {
    return await db
      .select()
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .innerJoin(books, eq(reservations.bookId, books.id))
      .where(eq(reservations.status, "active"))
      .orderBy(desc(reservations.reservedAt));
  }

  async getOverdueReservations(): Promise<(Reservation & { user: User; book: Book })[]> {
    return await db
      .select()
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .innerJoin(books, eq(reservations.bookId, books.id))
      .where(
        and(
          eq(reservations.status, "active"),
          sql`${reservations.dueDate} < NOW()`
        )
      )
      .orderBy(desc(reservations.dueDate));
  }

  // Fine operations
  async getUserFines(userId: string): Promise<Fine[]> {
    return await db
      .select()
      .from(fines)
      .where(eq(fines.userId, userId))
      .orderBy(desc(fines.createdAt));
  }

  async createFine(fine: InsertFine): Promise<Fine> {
    const [newFine] = await db.insert(fines).values(fine).returning();
    return newFine;
  }

  async updateFine(id: number, updates: Partial<Fine>): Promise<Fine> {
    const [fine] = await db
      .update(fines)
      .set(updates)
      .where(eq(fines.id, id))
      .returning();
    return fine;
  }

  async getTotalFines(userId: string): Promise<number> {
    const result = await db
      .select({ total: sql`COALESCE(SUM(${fines.amount}), 0)` })
      .from(fines)
      .where(and(eq(fines.userId, userId), eq(fines.status, "unpaid")));
    
    return Number(result[0]?.total || 0);
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    activeReservations: number;
    availableBooks: number;
    dueSoon: number;
    outstandingFines: number;
  }> {
    const [activeReservations] = await db
      .select({ count: sql`COUNT(*)` })
      .from(reservations)
      .where(and(eq(reservations.userId, userId), eq(reservations.status, "active")));

    const [availableBooks] = await db
      .select({ count: sql`SUM(${books.availableCopies})` })
      .from(books);

    const [dueSoon] = await db
      .select({ count: sql`COUNT(*)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.status, "active"),
          sql`${reservations.dueDate} BETWEEN NOW() AND NOW() + INTERVAL '3 days'`
        )
      );

    const totalFines = await this.getTotalFines(userId);

    return {
      activeReservations: Number(activeReservations.count || 0),
      availableBooks: Number(availableBooks.count || 0),
      dueSoon: Number(dueSoon.count || 0),
      outstandingFines: totalFines,
    };
  }
}

export const storage = new DatabaseStorage();
