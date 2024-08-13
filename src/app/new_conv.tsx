"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { newConversation } from "./actions";

export function CreateNewConversationButton() {
  const newConv_mut = useMutation({
    mutationFn: async () => newConversation(),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        newConv_mut.mutate();
      }}
    >
      <Button disabled={newConv_mut.isPending}>Create new conversation</Button>
    </form>
  );
}
