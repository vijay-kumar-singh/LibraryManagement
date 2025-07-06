import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
  variant?: "catalog" | "dashboard";
  onReserve?: () => void;
}

export default function BookCard({ book, variant = "catalog", onReserve }: BookCardProps) {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const reserveBookMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reservations", { bookId: book.id });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book reserved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onReserve?.();
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
        description: "Failed to reserve book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReserve = () => {
    if (book.availableCopies <= 0) {
      toast({
        title: "Unavailable",
        description: "This book is currently not available.",
        variant: "destructive",
      });
      return;
    }
    reserveBookMutation.mutate();
  };

  if (variant === "dashboard") {
    return (
      <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
        <img
          src={book.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
          alt={book.title}
          className="w-12 h-16 object-cover rounded shadow-sm"
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{book.title}</h4>
          <p className="text-sm text-gray-600">by {book.author}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge 
              className={book.availableCopies > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
              }
            >
              {book.availableCopies > 0 ? "Available" : "Reserved"}
            </Badge>
            <span className="text-xs text-gray-500">{book.genre}</span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleReserve}
            disabled={book.availableCopies <= 0 || reserveBookMutation.isPending}
            className={book.availableCopies > 0 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-orange-600 hover:bg-orange-700"
            }
            size="sm"
          >
            {reserveBookMutation.isPending 
              ? "Reserving..." 
              : book.availableCopies > 0 
                ? "Reserve" 
                : "Join Queue"
            }
          </Button>
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{book.title}</DialogTitle>
              </DialogHeader>
              <BookDetails book={book} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <Card className="library-shadow hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg">
          <img
            src={book.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-gray-600">by {book.author}</p>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {book.genre}
            </Badge>
            <Badge 
              className={book.availableCopies > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
              }
            >
              {book.availableCopies > 0 ? "Available" : "Reserved"}
            </Badge>
          </div>
          {book.availableCopies > 0 && (
            <p className="text-xs text-gray-500">
              {book.availableCopies} of {book.totalCopies} available
            </p>
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={handleReserve}
            disabled={book.availableCopies <= 0 || reserveBookMutation.isPending}
            className={book.availableCopies > 0 
              ? "flex-1 bg-blue-600 hover:bg-blue-700" 
              : "flex-1 bg-orange-600 hover:bg-orange-700"
            }
            size="sm"
          >
            {reserveBookMutation.isPending 
              ? "Reserving..." 
              : book.availableCopies > 0 
                ? "Reserve" 
                : "Join Queue"
            }
          </Button>
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{book.title}</DialogTitle>
              </DialogHeader>
              <BookDetails book={book} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function BookDetails({ book }: { book: Book }) {
  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        <img
          src={book.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
          alt={book.title}
          className="w-32 h-44 object-cover rounded-lg shadow-md"
        />
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{book.title}</h3>
            <p className="text-lg text-gray-600">by {book.author}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Genre:</span>
              <p className="text-gray-900">{book.genre}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">ISBN:</span>
              <p className="text-gray-900">{book.isbn || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Publication Year:</span>
              <p className="text-gray-900">{book.publicationYear || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Availability:</span>
              <p className="text-gray-900">
                {book.availableCopies} of {book.totalCopies} available
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge 
              className={book.availableCopies > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
              }
            >
              {book.availableCopies > 0 ? "Available" : "Reserved"}
            </Badge>
            <Badge variant="outline">{book.genre}</Badge>
          </div>
        </div>
      </div>
      {book.description && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700 leading-relaxed">{book.description}</p>
        </div>
      )}
    </div>
  );
}
