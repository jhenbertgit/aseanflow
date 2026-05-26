"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createTransfer,
  getTransferByTrackingCode,
  type CreateTransferPayload,
} from "./transfer";
import { getQuote } from "./quote";
import { getWalletInfo, getWalletHistory } from "./wallet";
import { getDashboard } from "./user";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useQuote(
  amount: number,
  from: string = "PHP",
  to: string = "IDR",
  trackingCode?: string,
) {
  const debouncedAmount = useDebounce(amount, 300);
  const debouncedTrackingCode = useDebounce(trackingCode ?? "", 300);

  return useQuery({
    queryKey: ["quote", debouncedAmount, from, to, debouncedTrackingCode],
    queryFn: () =>
      getQuote(
        debouncedAmount,
        from,
        to,
        debouncedTrackingCode || undefined,
      ),
    enabled: debouncedAmount > 0 && debouncedAmount <= 1_000_000_000,
    staleTime: 10_000,
  });
}

export function useCreateTransfer() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => createTransfer(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
    retry: false,
    placeholderData: (prev) => prev,
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

export function useDashboard(cookieToken: string | null) {
  return useQuery({
    queryKey: ["dashboard", cookieToken],
    queryFn: () => getDashboard(cookieToken!),
    enabled: !!cookieToken,
    staleTime: 15_000,
  });
}
