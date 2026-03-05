import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Counter {
  id: string;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export function useCounters() {
  return useQuery({
    queryKey: ["counters"],
    queryFn: () => apiFetch<Counter[]>("/counters"),
  });
}

export function useCounter(name: string) {
  return useQuery({
    queryKey: ["counters", name],
    queryFn: () => apiFetch<Counter>(`/counters/${name}`),
  });
}

export function useUpdateCounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, delta }: { name: string; delta: number }) =>
      apiFetch<Counter>(`/counters/${name}`, {
        method: "PATCH",
        body: JSON.stringify({ delta }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["counters"] });
    },
  });
}

export function useCreateCounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Counter>("/counters", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["counters"] });
    },
  });
}

export function useDeleteCounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<void>(`/counters/${name}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["counters"] });
    },
  });
}
