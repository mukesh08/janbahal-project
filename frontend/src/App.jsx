import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import PublicViewer   from './pages/PublicViewer';
import BlogList       from './pages/BlogList';
import BlogPost       from './pages/BlogPost';

import AdminDashboard from './pages/AdminDashboard';
import Dashboard      from './pages/admin/Dashboard';
import Editor         from './pages/Editor';
import MenuManager    from './pages/admin/MenuManager';
import FooterManager  from './pages/admin/FooterManager';
import BlogManager    from './pages/admin/BlogManager';
import PostsManager   from './pages/admin/PostsManager';
import PostEditor     from './pages/admin/PostEditor';
import HeaderManager   from './pages/admin/HeaderManager';
import CustomizeManager from './pages/admin/CustomizeManager';
import UploadManager  from './pages/admin/UploadManager';
import UsersManager   from './pages/admin/UsersManager';
import AccountManager from './pages/admin/AccountManager';

const Guard = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"            element={<Landing />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/page/:slug"  element={<PublicViewer />} />
          <Route path="/blog"        element={<BlogList />} />
          <Route path="/blog/:slug"  element={<BlogPost />} />

          {/* ── Admin (protected) ── */}
          <Route path="/admin"               element={<Guard><Dashboard /></Guard>} />
          <Route path="/admin/pages"         element={<Guard><AdminDashboard /></Guard>} />
          <Route path="/admin/editor/:id"    element={<Guard><Editor /></Guard>} />
          <Route path="/admin/menu"          element={<Guard><MenuManager /></Guard>} />
          <Route path="/admin/footer"        element={<Guard><FooterManager /></Guard>} />
          <Route path="/admin/customize"         element={<Guard><CustomizeManager /></Guard>} />
          <Route path="/admin/header"            element={<Guard><HeaderManager /></Guard>} />
          <Route path="/admin/blog"              element={<Guard><BlogManager /></Guard>} />
          <Route path="/admin/posts"           element={<Guard><PostsManager /></Guard>} />
          <Route path="/admin/posts/new"       element={<Guard><PostEditor /></Guard>} />
          <Route path="/admin/posts/:id/edit"  element={<Guard><PostEditor /></Guard>} />
          <Route path="/admin/upload"          element={<Guard><UploadManager /></Guard>} />
          <Route path="/admin/users"           element={<Guard><UsersManager /></Guard>} />
          <Route path="/admin/account"         element={<Guard><AccountManager /></Guard>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
