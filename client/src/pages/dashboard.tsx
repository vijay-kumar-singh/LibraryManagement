import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatsCard from "@/components/stats-card";
import BookCard from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bookmark, Clock, DollarSign, Search, List, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["/api/books"],
    retry: false,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["/api/reservations"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const popularBooks = books.slice(0, 3);
  const recentReservations = reservations.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Dashboard Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Dashboard</h2>
            <p className="text-gray-600">Welcome back! Here's what's happening in your library.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Reservations"
              value={stats?.activeReservations || 0}
              icon={Bookmark}
              color="blue"
              loading={statsLoading}
            />
            <StatsCard
              title="Books Available"
              value={stats?.availableBooks || 0}
              icon={BookOpen}
              color="green"
              loading={statsLoading}
            />
            <StatsCard
              title="Due Soon"
              value={stats?.dueSoon || 0}
              icon={Clock}
              color="orange"
              loading={statsLoading}
            />
            <StatsCard
              title="Outstanding Fines"
              value={`$${stats?.outstandingFines?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              color="red"
              loading={statsLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Popular Books Section */}
            <div className="lg:col-span-2">
              <Card className="library-shadow">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-800">Popular Books</CardTitle>
                    <Link to="/books">
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {booksLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="w-12 h-16 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularBooks.map((book) => (
                        <BookCard key={book.id} book={book} variant="dashboard" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="library-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/books">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Search className="w-4 h-4 mr-2" />
                      Advanced Search
                    </Button>
                  </Link>
                  <Link to="/reservations">
                    <Button variant="outline" className="w-full">
                      <List className="w-4 h-4 mr-2" />
                      My Reservations
                    </Button>
                  </Link>
                  <Link to="/payment">
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Fines
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Current Reservations */}
              <Card className="library-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">Current Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  {reservationsLoading ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-3 border rounded-lg p-3">
                            <div className="w-8 h-10 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentReservations.length > 0 ? (
                    <div className="space-y-3">
                      {recentReservations.map((reservation) => (
                        <div key={reservation.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={reservation.book.coverUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop"}
                              alt={reservation.book.title}
                              className="w-8 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{reservation.book.title}</p>
                              <p className="text-xs text-gray-600">
                                Due: {new Date(reservation.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Link to="/reservations">
                        <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2">
                          View All Reservations
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No active reservations</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="library-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <BookOpen className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">Book catalog updated</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Bookmark className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">New reservation created</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
