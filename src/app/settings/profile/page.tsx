import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileSettingsPage } from "./profile.client";
import { cookies } from "next/headers";

export default function ProfileSettings() {
  const userCookie = cookies().get("userId");
  const userId = userCookie!.value;
  return (
    <div className="div max-w-4xl p-4">
      <ProfileSettingsPage userId={userId} />
    </div>
  );
}
