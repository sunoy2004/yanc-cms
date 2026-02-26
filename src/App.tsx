import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CMSLayout } from "@/components/cms/CMSLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HeroContent from "./pages/HeroContent";
import Events from "./pages/Events";
import PastEvents from "./pages/PastEvents";
import EventGallery from "./pages/EventGallery";
// COMMENTED OUT: EventHighlights import - temporarily disabled
// import EventHighlights from "./pages/EventHighlights";
import Programs from "./pages/Programs";
import MentorTalks from "./pages/MentorTalks";
import TeamManagement from "./pages/TeamManagement";
import ContentSection from "./pages/ContentSection";
import AboutUsManagement from "./pages/AboutUsManagement";
import MediaLibrary from "./pages/MediaLibrary";
import Settings from "./pages/Settings";
import AdminProfile from "./pages/AdminProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected CMS routes */}
            <Route element={<CMSLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hero" element={<HeroContent />} />
              
              {/* Events */}
              <Route path="/events" element={<Events />} />
              <Route path="/events/past" element={<PastEvents />} />
              <Route path="/events/gallery" element={<EventGallery />} />
              {/* COMMENTED OUT: Highlights route - temporarily disabled */}
              {/* <Route path="/events/highlights" element={<EventHighlights />} /> */}
              
              {/* Programs & Talks */}
              <Route path="/programs" element={<Programs />} />
              <Route path="/mentor-talks" element={<MentorTalks />} />
              
              {/* Team Management */}
              <Route path="/team/executive" element={<TeamManagement type="executive" />} />
              <Route path="/team/cohort-founders" element={<TeamManagement type="cohort_founder" />} />
              <Route path="/team/advisory" element={<TeamManagement type="advisory" />} />
              <Route path="/team/mentors" element={<TeamManagement type="global_mentor" />} />
              
              {/* Content Sections */}
              <Route path="/content/about" element={<AboutUsManagement />} />
              <Route path="/content/testimonials" element={<ContentSection type="testimonials" />} />
              <Route path="/content/contact" element={<ContentSection type="contact" />} />
              
              {/* Media & Settings */}
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<AdminProfile />} />
            </Route>
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
