import { useState } from "react";
import { useCounters, useUpdateCounter, useCreateCounter, useDeleteCounter } from "@/hooks/use-counter";

export default function CounterPage() {
  const { data: counters, isLoading, error } = useCounters();
  const updateCounter = useUpdateCounter();
  const createCounter = useCreateCounter();
  const deleteCounter = useDeleteCounter();
  const [newName, setNewName] = useState("");

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Counters</h1>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New counter name"
          className="flex-1 px-3 py-2 border rounded-md bg-transparent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newName.trim()) {
              createCounter.mutate(newName.trim());
              setNewName("");
            }
          }}
        />
        <button
          onClick={() => {
            if (newName.trim()) {
              createCounter.mutate(newName.trim());
              setNewName("");
            }
          }}
          disabled={createCounter.isPending}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {counters?.map((counter) => (
          <div
            key={counter.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <span className="font-medium">{counter.name}</span>
              <span className="ml-4 text-2xl font-mono font-bold">{counter.value}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateCounter.mutate({ name: counter.name, delta: -1 })}
                className="w-9 h-9 flex items-center justify-center border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                -
              </button>
              <button
                onClick={() => updateCounter.mutate({ name: counter.name, delta: 1 })}
                className="w-9 h-9 flex items-center justify-center border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                +
              </button>
              <button
                onClick={() => deleteCounter.mutate(counter.name)}
                className="w-9 h-9 flex items-center justify-center border rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                x
              </button>
            </div>
          </div>
        ))}
        {counters?.length === 0 && (
          <p className="text-center text-neutral-500 py-8">No counters yet</p>
        )}
      </div>
    </div>
  );
}
