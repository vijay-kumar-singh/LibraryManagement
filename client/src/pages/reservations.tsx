import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen } from "lucide-react";

export default function Reservations() {
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

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["/api/reservations"],
    retry: false,
  });

  const returnBookMutation = useMutation({
    mutationFn: async (reservationId: number) => {
      await apiRequest("PUT", `/api/reservations/${reservationId}`, {
        status: "completed",
        completedAt: new Date(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book returned successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to return book. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeReservations = reservations.filter((r) => r.status === "active");
  const completedReservations = reservations.filter((r) => r.status === "completed");

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return due <= threeDaysFromNow && due >= now;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800 mb-2">My Reservations</h2>
            <p className="text-gray-600">Manage your current and past book reservations</p>
          </div>

          {/* Active Reservations */}
          <Card className="library-shadow mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Active Reservations ({activeReservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-4 p-6 border rounded-lg">
                        <div className="w-16 h-20 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeReservations.length > 0 ? (
                <div className="space-y-4">
                  {activeReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center space-x-4 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <img
                        src={reservation.book.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
                        alt={reservation.book.title}
                        className="w-16 h-20 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-lg">{reservation.book.title}</h4>
                        <p className="text-gray-600 mb-2">by {reservation.book.author}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Reserved: {new Date(reservation.reservedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Due: {new Date(reservation.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          {isOverdue(reservation.dueDate) ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : isDueSoon(reservation.dueDate) ? (
                            <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={() => returnBookMutation.mutate(reservation.id)}
                          disabled={returnBookMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {returnBookMutation.isPending ? "Returning..." : "Return Book"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active reservations</h3>
                  <p className="text-gray-600">Visit the book catalog to make your first reservation</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservation History */}
          <Card className="library-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Reservation History ({completedReservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedReservations.length > 0 ? (
                <div className="space-y-4">
                  {completedReservations.slice(0, 5).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={reservation.book.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
                        alt={reservation.book.title}
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{reservation.book.title}</h4>
                        <p className="text-sm text-gray-600">by {reservation.book.author}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>Reserved: {new Date(reservation.reservedAt).toLocaleDateString()}</span>
                          {reservation.completedAt && (
                            <span>Returned: {new Date(reservation.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  ))}
                  {completedReservations.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-4">
                      ... and {completedReservations.length - 5} more completed reservations
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reservation history</h3>
                  <p className="text-gray-600">Your completed reservations will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
