import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { LibraryPage } from "@/components/library/LibraryPage";
import { ChatPage } from "@/components/chat/ChatPage";
import { NotesPage } from "@/components/notes/NotesPage";
import { ProfilePage } from "@/components/profile/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tab layout */}
        <Route element={<MobileLayout />}>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>

      <Toaster position="top-center" richColors duration={2000} />
    </BrowserRouter>
  );
}
