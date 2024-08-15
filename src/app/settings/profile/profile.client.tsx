"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { atom, useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { api } from "@/trpc/react";

function updateUserCookie(updatedId: string) {
  // preserve other cookies
  const cookies = document.cookie
    .split(";")
    .filter((cookie) => !cookie.includes("userId="))
    .join("; ");
  const updatedCookies = cookies
    ? `${cookies}; userId=${updatedId}; path=/`
    : `userId=${updatedId}; path=/`;
  document.cookie = updatedCookies;
  console.log("updatedCookie", updatedCookies);
}

const userIdAtom = atom<string>("<placeholder>");

const profileFormSchema = z.object({
  userId: z
    .string()
    .min(10)
    // .superRefine((value) => {})
    .refine((value) => {
      return value.startsWith("user_");
    }),
});

export function ProfileSettingsPage(props: { userId: string }) {
  useHydrateAtoms([[userIdAtom, props.userId]]);
  const t_ctx = api.useUtils();
  const [userId, setUserId] = useAtom(userIdAtom);
  const copy = useCopyToClipboard();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      userId,
    },
  });

  function onSubmit(data: z.infer<typeof profileFormSchema>) {
    console.log("sending", data);
    setUserId(data.userId);
    form.reset(data);
    updateUserCookie(data.userId);
    void t_ctx.invalidate();
  }

  return (
    <div className="contents">
      <Form {...form}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-medium">Account information</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Your user id"
                              className="pr-8"
                              {...field}
                            ></Input>
                            <Button
                              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                              size={"sm"}
                              variant="ghost"
                              type="button"
                              onClick={() => {
                                copy.copyToClipboard(form.getValues("userId"));
                              }}
                            >
                              {copy.isCopied ? (
                                <CheckIcon className="size-3" />
                              ) : (
                                <CopyIcon className="size-3" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              size="sm"
              variant="outline"
              type="reset"
              form="profile-form"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button
              form="profile-form"
              size="sm"
              type="submit"
              disabled={!form.formState.isValid || !form.formState.isDirty}
            >
              Save
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
