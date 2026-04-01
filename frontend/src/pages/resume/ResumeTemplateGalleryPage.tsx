import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/Header';
import { useAppStore } from '../../store/useAppStore';

export default function ResumeTemplateGalleryPage() {
  const navigate = useNavigate();
  const [builderHeight, setBuilderHeight] = useState(1280);
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userPlan = (user?.plan || 'free').toLowerCase();
  
  // Determine which page to show based on URL
  const currentPath = window.location.pathname;
  const isEditorPage = currentPath.includes('/resume-editor');
  const htmlFile = isEditorPage ? 'editor.html' : 'gallery.html';

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data as { type?: string; height?: number };
      if (data?.type === 'resume-builder-login-required') {
        navigate('/auth');
        return;
      }

      if (data?.type !== 'resume-builder-height' || typeof data.height !== 'number') {
        return;
      }

      setBuilderHeight(Math.max(900, Math.min(5000, Math.ceil(data.height))));
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-slate-900">
      <Header />

      <div className="w-full pt-20">
        <iframe
          title="Code Campus AI Resume Builder"
          src={`/resume-builder/${htmlFile}${window.location.search ? window.location.search + '&' : '?'}plan=${encodeURIComponent(userPlan)}&guest=${isAuthenticated ? '0' : '1'}`}
          className="block w-full border-0 bg-transparent"
          style={{ height: `${builderHeight}px` }}
        />
      </div>
    </div>
  );
}
