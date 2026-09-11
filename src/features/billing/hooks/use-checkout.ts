import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useCheckout() {
  const router = useRouter();

  const checkout = useCallback(() => {
    router.push("/billing");
  }, [router]);

  return { checkout, isPending: false };
}
