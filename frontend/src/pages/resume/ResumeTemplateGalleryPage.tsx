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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 text-gray-900">
      <Header />

      <div className="mx-auto w-full max-w-[1780px] px-4 pb-16 pt-24 sm:px-6 lg:px-12">
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-100/80 bg-white px-6 py-5 shadow-[0_16px_34px_rgba(15,23,42,0.07)] sm:px-8 sm:py-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">CodeCampus AI Resume Builder</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-[2.5rem]">
                Build a Professional Resume in Minutes
              </h1>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Pick a template, add your details, preview instantly, and download an ATS-ready resume with a polished look.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm sm:text-sm">
              15 Templates • ATS Optimized
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-100/70 bg-white/90 p-2 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-3 lg:p-4">
          <iframe
            title="Code Campus AI Resume Builder"
            src={`/resume-builder/index.html?plan=${encodeURIComponent(userPlan)}&guest=${isAuthenticated ? '0' : '1'}`}
            className="w-full rounded-xl border border-gray-100 bg-white"
            style={{ height: `${builderHeight}px` }}
          />
        </div>
      </div>
    </div>
  );
}
