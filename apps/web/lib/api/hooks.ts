"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createTransfer, getTransferByTrackingCode } from "./transfer";
import { getQuote } from "./quote";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useQuote(amount: number) {
  const debouncedAmount = useDebounce(amount, 300);

  return useQuery({
    queryKey: ["quote", debouncedAmount],
    queryFn: () => getQuote(debouncedAmount),
    enabled: debouncedAmount > 0 && debouncedAmount <= 1_000_000,
    staleTime: 10_000,
  });
}

export function useCreateTransfer() {
  const router = useRouter();

  return useMutation({
    mutationFn: (amount: number) => createTransfer(amount),
    onSuccess: (data) => {
      router.push(`/transfer/${data.trackingCode}`);
    },
  });
}

export function useTransferStatus(trackingCode: string) {
  return useQuery({
    queryKey: ["transfer", trackingCode],
    queryFn: () => getTransferByTrackingCode(trackingCode),
    refetchInterval: (query) => {
      if (query.state.data?.status === "MORPH_ANCHORED") return false;
      return 1000;
    },
    enabled: !!trackingCode,
  });
}
