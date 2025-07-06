import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, CreditCard } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">LibraryFlow</h1>
          </div>
          <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Library Management Made Simple
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your library operations with our comprehensive management system. 
            Handle books, reservations, and payments all in one place.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h3>
          <p className="text-lg text-gray-600">Powerful features designed for modern libraries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="library-shadow">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Book Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Comprehensive book management with search, filtering, and availability tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="library-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Role-based access control for librarians and patrons with detailed profiles
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="library-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Easy book reservations with queue management and due date tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="library-shadow">
            <CardHeader className="text-center">
              <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Secure fine payments with Stripe integration and automated billing
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Library?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join libraries worldwide using LibraryFlow for better management
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            variant="secondary" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">LibraryFlow</span>
          </div>
          <p className="text-gray-400">
            © 2025 LibraryFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
