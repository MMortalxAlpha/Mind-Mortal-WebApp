import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <XCircle className="text-red-500 mb-4" size={72} />
      <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Oops! Something went wrong with your payment. Please try again or
        contact support if the issue persists.
      </p>
      <Button onClick={() => navigate("/pricing")}>Back to Pricing</Button>
    </div>
  );
};

export default PaymentFailed;
