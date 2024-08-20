"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { newSpace } from "./actions";

export function CreateNewConversationButton() {
  const newSpace_mut = useMutation({
    mutationFn: async () => newSpace(),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        newSpace_mut.mutate();
      }}
    >
      <Button disabled={newSpace_mut.isPending}>Create new space</Button>
    </form>
  );
}
