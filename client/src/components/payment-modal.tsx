import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PaymentForm = ({ amount, onSuccess }: { amount: number; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your fine has been paid successfully!",
      });
      onSuccess();
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button 
          type="submit" 
          disabled={!stripe || processing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

export default function PaymentModal({ open, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [outstandingFines, setOutstandingFines] = useState(0);

  // Set outstanding fines when user loads
  useEffect(() => {
    if (user?.outstandingFines) {
      const fines = parseFloat(user.outstandingFines);
      setOutstandingFines(fines);
      setPaymentAmount(fines.toFixed(2));
    }
  }, [user]);

  const createPaymentIntent = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount });
      
      if (response.status === 503) {
        toast({
          title: "Payment Unavailable",
          description: "Payment processing is not available in demo mode.",
          variant: "destructive",
        });
        return;
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setClientSecret("");
    setPaymentAmount("");
    setOutstandingFines(0);
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setClientSecret("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-800">
              Pay Outstanding Fines
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Outstanding Balance:</span>
              <span className="text-xl font-bold text-gray-800">
                ${outstandingFines.toFixed(2)}
              </span>
            </div>
          </div>
          
          {!clientSecret ? (
            <>
              <div>
                <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={createPaymentIntent}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  Continue to Payment
                </Button>
              </div>
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                amount={parseFloat(paymentAmount)} 
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
