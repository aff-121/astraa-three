"use client";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserTickets } from "@/hooks/useTickets";
import {
  User,
  Ticket,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Download,
  Share2,
  ChevronRight,
  Lock,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const menuItems = [
  { id: "profile", label: "Edit Profile", icon: User },
  { id: "tickets", label: "Your Tickets", icon: Ticket },
  { id: "password", label: "Change Password", icon: Lock },
  { id: "notifications", label: "Manage Notifications", icon: Bell },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "settings", label: "Account Settings", icon: Settings },
];

export default function Page() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, updatePassword } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tickets, isLoading: ticketsLoading } = useUserTickets();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState("profile");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/signin?redirect=/account");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName, phone });
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update profile.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password Updated", description: "Your password has been updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsUpdatingPassword(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    navigate("/");
  };

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // If not logged in, show loading while redirecting (prevents flash of account page)
  if (!user) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground">Edit Profile</h2>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <Button variant="outline" className="rounded-full">
                Change Photo
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input value={user?.email || ""} disabled className="bg-muted border-border opacity-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
            </div>
            <Button
              variant="coral"
              className="rounded-full"
              onClick={handleUpdateProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        );

      case "tickets":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground">Your Tickets</h2>
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block bg-cinema-elevated rounded-2xl p-6 border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-display font-bold text-foreground mb-2">{ticket.event?.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {ticket.event?.date} at {ticket.event?.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{ticket.event?.venue}</span>
                          </div>
                          <p className="text-primary font-medium">{ticket.category?.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Ticket #: {ticket.ticket_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full gap-2">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tickets found</p>
                <Link href="/events">
                  <Button variant="coral" className="rounded-full">
                    Browse Events
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );

      case "password":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground">Change Password</h2>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
              <Button
                variant="coral"
                className="rounded-full"
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Section coming soon...</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-cinema-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{profile?.full_name || "User"}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || user?.phone}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="flex-1">Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-cinema-card rounded-2xl p-8 border border-border">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-cinema-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Make sure you have saved your work before logging out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
