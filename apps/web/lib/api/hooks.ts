"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createTransfer, getTransferByTrackingCode } from "./transfer";
import { getQuote } from "./quote";
import { getWalletInfo, getWalletHistory } from "./wallet";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useQuote(amount: number, trackingCode?: string) {
  const debouncedAmount = useDebounce(amount, 300);
  const debouncedTrackingCode = useDebounce(trackingCode ?? "", 300);

  return useQuery({
    queryKey: ["quote", debouncedAmount, debouncedTrackingCode],
    queryFn: () =>
      getQuote(
        debouncedAmount,
        "PHP",
        "IDR",
        debouncedTrackingCode || undefined,
      ),
    enabled: debouncedAmount > 0 && debouncedAmount <= 1_000_000,
    staleTime: 10_000,
  });
}

export function useCreateTransfer() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      amount,
      trackingCode,
    }: {
      amount: number;
      trackingCode?: string;
    }) => createTransfer(amount, "PHP", "IDR", trackingCode),
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

export function useWallet(trackingCode: string) {
  return useQuery({
    queryKey: ["wallet", trackingCode],
    queryFn: () => getWalletInfo(trackingCode),
    enabled: !!trackingCode,
    staleTime: 30_000,
  });
}

export function useWalletHistory(trackingCode: string) {
  return useQuery({
    queryKey: ["wallet-history", trackingCode],
    queryFn: () => getWalletHistory(trackingCode),
    enabled: !!trackingCode,
    staleTime: 30_000,
  });
}
