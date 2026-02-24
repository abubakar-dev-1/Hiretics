"use client";

import { useForm } from "react-hook-form";
import { useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  CreditCard,
  Camera,
  Trash2,
  X,
  Mail,
  Lock,
  Check,
  Loader2,
} from "lucide-react";
import ChangeEmailDialog from "@/components/settings/ChangeEmailDialouge";
import ChangePasswordDialog from "@/components/settings/ChangePasswordDialouge";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type SettingsTab = "general" | "security" | "billing";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Plans & Billing", icon: CreditCard },
];

export default function SettingsProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [userData, setUserData] = useState<{ displayName: string; email: string }>({
    displayName: "",
    email: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserData({
          displayName: parsed.displayName || "",
          email: parsed.email || "",
        });
      } catch {}
    }
  }, []);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (userData.displayName) {
      form.reset({ name: userData.displayName });
    }
  }, [userData.displayName]);

  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.displayName = data.name;
        localStorage.setItem("user", JSON.stringify(parsed));
        setUserData((prev) => ({ ...prev, displayName: data.name }));
      }
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const goToMainScreen = () => {
    router.push("/");
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") goToMainScreen();
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, []);

  const handleTabClick = (tab: SettingsTab) => {
    if (tab === "billing") {
      router.push("/pricing");
      return;
    }
    setActiveTab(tab);
  };

  const initials =
    userData.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToMainScreen}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
            Close
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px] text-muted-foreground">
              Esc
            </kbd>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Side nav */}
          <nav className="lg:w-52 shrink-0">
            <ul className="flex lg:flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id && tab.id !== "billing";
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#16A34A]/10 text-[#16A34A]"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {activeTab === "general" && (
              <>
                {/* Profile photo section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Photo</CardTitle>
                    <CardDescription>
                      This will be displayed on your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 ring-2 ring-border">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={userData.displayName} />
                        ) : (
                          <AvatarFallback className="bg-[#16A34A]/10 text-[#16A34A] text-xl font-semibold">
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2"
                          >
                            <Camera size={14} />
                            Upload
                          </Button>
                          {avatarUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAvatarUrl("")}
                              className="gap-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={14} />
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Max 2MB.
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Personal info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Personal Information</CardTitle>
                    <CardDescription>
                      Update your name and personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="max-w-md">
                              <FormLabel>Full name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter your full name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="max-w-md">
                          <FormLabel className="text-sm font-medium">
                            Email address
                          </FormLabel>
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {userData.email || "No email set"}
                          </p>
                        </div>

                        <Separator />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "security" && (
              <>
                {/* Email */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Email Address</CardTitle>
                    <CardDescription>
                      Manage the email address associated with your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between max-w-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Mail size={18} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{userData.email}</p>
                          <p className="text-xs text-muted-foreground">Primary email</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmailDialogOpen(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Password */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between max-w-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Lock size={18} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Password</p>
                          <p className="text-xs text-muted-foreground">
                            Last changed — unknown
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger zone */}
                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-base text-destructive">
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible actions that affect your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between max-w-lg">
                      <div>
                        <p className="text-sm font-medium">Delete account</p>
                        <p className="text-xs text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <ChangeEmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
      />
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </div>
  );
}
