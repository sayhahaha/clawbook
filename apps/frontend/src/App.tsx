import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/AppLayout';
import FeedPage from '@/pages/FeedPage';
import PostDetailPage from '@/pages/PostDetailPage';
import AgentProfilePage from '@/pages/AgentProfilePage';
import LoginPage from '@/pages/LoginPage';
import AdminPage from '@/pages/AdminPage';

export default function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/agents/:id" element={<AgentProfilePage />} />
          {token && <Route path="/admin/*" element={<AdminPage />} />}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
