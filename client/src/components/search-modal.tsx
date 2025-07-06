import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
}

export default function SearchModal({ open, onClose, onSearch }: SearchModalProps) {
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    availability: "",
    yearFrom: "",
    yearTo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    
    // Convert year strings to numbers if present
    if (cleanFilters.yearFrom) {
      cleanFilters.yearFrom = parseInt(cleanFilters.yearFrom);
    }
    if (cleanFilters.yearTo) {
      cleanFilters.yearTo = parseInt(cleanFilters.yearTo);
    }
    
    onSearch(cleanFilters);
  };

  const handleClear = () => {
    setFilters({
      title: "",
      author: "",
      genre: "",
      isbn: "",
      availability: "",
      yearFrom: "",
      yearTo: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-800">
              Advanced Book Search
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter book title"
                value={filters.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </Label>
              <Input
                id="author"
                type="text"
                placeholder="Enter author name"
                value={filters.author}
                onChange={(e) => handleChange("author", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </Label>
              <Select value={filters.genre} onValueChange={(value) => handleChange("genre", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genres</SelectItem>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Biography">Biography</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Thriller">Thriller</SelectItem>
                  <SelectItem value="Self-Help">Self-Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </Label>
              <Input
                id="isbn"
                type="text"
                placeholder="Enter ISBN"
                value={filters.isbn}
                onChange={(e) => handleChange("isbn", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </Label>
              <Select value={filters.availability} onValueChange={(value) => handleChange("availability", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Reserved/Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Year
              </Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="From"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={filters.yearFrom}
                  onChange={(e) => handleChange("yearFrom", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="To"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={filters.yearTo}
                  onChange={(e) => handleChange("yearTo", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
            >
              Clear Filters
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Search Books
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
