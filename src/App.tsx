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
import Programs from "./pages/Programs";
import MentorTalks from "./pages/MentorTalks";
import TeamManagement from "./pages/TeamManagement";
import ContentSection from "./pages/ContentSection";
import MediaLibrary from "./pages/MediaLibrary";
import Settings from "./pages/Settings";
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
            
            {/* Protected CMS routes */}
            <Route element={<CMSLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hero" element={<HeroContent />} />
              
              {/* Events */}
              <Route path="/events/past" element={<Events type="past" />} />
              <Route path="/events/gallery" element={<Events type="gallery" />} />
              <Route path="/events/highlights" element={<Events type="highlights" />} />
              
              {/* Programs & Talks */}
              <Route path="/programs" element={<Programs />} />
              <Route path="/mentor-talks" element={<MentorTalks />} />
              
              {/* Team Management */}
              <Route path="/team/executive" element={<TeamManagement type="executive" />} />
              <Route path="/team/cohort-founders" element={<TeamManagement type="cohort_founder" />} />
              <Route path="/team/advisory" element={<TeamManagement type="advisory" />} />
              <Route path="/team/mentors" element={<TeamManagement type="global_mentor" />} />
              
              {/* Content Sections */}
              <Route path="/content/about" element={<ContentSection type="about" />} />
              <Route path="/content/testimonials" element={<ContentSection type="testimonials" />} />
              <Route path="/content/contact" element={<ContentSection type="contact" />} />
              
              {/* Media & Settings */}
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/settings" element={<Settings />} />
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
