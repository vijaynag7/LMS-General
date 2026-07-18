import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CheckoutOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
  courseTitle: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase.functions.invoke<CheckoutOrder>("checkout-order", { body: { courseId } });
      if (error) throw error;
      if (!data) throw new Error("No response from checkout-order function");
      return data;
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      const { data, error } = await supabase.functions.invoke("verify-payment", { body: params });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}
