import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupSimpleAuth, isAuthenticated as simpleAuthCheck } from "./simpleAuth";
import { insertBookSchema, insertReservationSchema } from "@shared/schema";
import { z } from "zod";

// Check if we should use mock data
const useMockData = !process.env.DATABASE_URL;

// Initialize Stripe only if key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  console.log("Stripe payment processing enabled");
} else {
  console.log("Stripe not configured - payment features disabled");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - use Replit Auth if available, otherwise simple auth
  const useReplitAuth = process.env.REPLIT_DOMAINS && process.env.REPL_ID;
  let authMiddleware: typeof isAuthenticated;
  
  if (useReplitAuth) {
    await setupAuth(app);
    authMiddleware = isAuthenticated;
  } else {
    await setupSimpleAuth(app);
    authMiddleware = simpleAuthCheck;
  }

  // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const { search, genre, author, availability, yearFrom, yearTo } = req.query;
      
      const books = await storage.searchBooks(
        search as string || '',
        {
          genre: genre as string,
          author: author as string,
          availability: availability as string,
          yearFrom: yearFrom ? parseInt(yearFrom as string) : undefined,
          yearTo: yearTo ? parseInt(yearTo as string) : undefined,
        }
      );
      
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const book = await storage.getBook(parseInt(req.params.id));
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post('/api/books', authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put('/api/books/:id', authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const book = await storage.updateBook(parseInt(req.params.id), req.body);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete('/api/books/:id', authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteBook(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Reservation routes
  app.get('/api/reservations', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reservations = await storage.getUserReservations(userId);
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.post('/api/reservations', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookId } = req.body;

      // Check if book is available
      const book = await storage.getBook(bookId);
      if (!book || book.availableCopies <= 0) {
        return res.status(400).json({ message: "Book is not available" });
      }

      // Create reservation
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

      const reservationData = {
        userId,
        bookId,
        dueDate,
        status: "active" as const,
      };

      const reservation = await storage.createReservation(reservationData);
      
      // Update book availability
      await storage.updateBookAvailability(bookId, book.availableCopies - 1);

      res.status(201).json(reservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });

  app.put('/api/reservations/:id', authMiddleware, async (req: any, res) => {
    try {
      const reservation = await storage.updateReservation(parseInt(req.params.id), req.body);
      res.json(reservation);
    } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(500).json({ message: "Failed to update reservation" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/reservations', authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const reservations = await storage.getActiveReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching admin reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", authMiddleware, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing is not available in demo mode. Stripe configuration required." 
      });
    }

    try {
      const { amount } = req.body;
      const userId = req.user.claims.sub;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId,
        },
      });

      // Create payment record
      await storage.createPayment({
        userId,
        amount: amount.toString(),
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/payment/confirm', authMiddleware, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing is not available in demo mode. Stripe configuration required." 
      });
    }

    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.claims.sub;

      // Update payment status
      const payments = await storage.getUserPayments(userId);
      const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
      
      if (payment) {
        await storage.updatePayment(payment.id, {
          status: "completed",
          completedAt: new Date(),
        });

        // Update user's outstanding fines
        const user = await storage.getUser(userId);
        if (user) {
          const newBalance = Math.max(0, parseFloat(user.outstandingFines || "0") - parseFloat(payment.amount));
          await storage.updateUser(userId, { outstandingFines: newBalance.toString() });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
