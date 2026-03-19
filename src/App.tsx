import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Packages from "./pages/Packages";
import Book from "./pages/Book";
import Faq from "./pages/Faq";
import OurStory from "./pages/OurStory";
import ThankYou from "./pages/ThankYou";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CustomerLogin from "./pages/CustomerLogin";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Receipt from "./pages/Receipt";
import AdminLogin from "./pages/AdminLogin";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminParks from "./pages/admin/AdminParks";
import AdminEquipment from "./pages/admin/AdminEquipment";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminFaq from "./pages/admin/AdminFaq";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSms from "./pages/admin/AdminSms";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/book" element={<Book />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/customer-login" element={<CustomerLogin />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/receipt/:id" element={<Receipt />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminBookings />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/parks" element={<AdminParks />} />
            <Route path="/admin/equipment" element={<AdminEquipment />} />
            <Route path="/admin/discounts" element={<AdminDiscounts />} />
            <Route path="/admin/faq" element={<AdminFaq />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/sms" element={<AdminSms />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
