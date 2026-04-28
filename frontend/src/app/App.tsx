import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Bell, Search, X } from 'lucide-react';
import { PricingCheckout } from './components/PricingCheckout';
import { ContentDiscovery } from './components/ContentDiscovery';
import { AdminDashboard } from './components/AdminDashboard';
import { CreatorStudio } from './components/CreatorStudio';
import { UserSettings } from './components/UserSettings';
import { UserMenu } from './components/UserMenu';
import { Sidebar } from './components/Sidebar';
import { LikedContent } from './components/LikedContent';
import { CreatorProfile } from './components/CreatorProfile';
import { OfflineContent } from './components/OfflineContent';
import { ContentDetail } from './components/ContentDetail';
import { LoginScreen } from './components/LoginScreen';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover';
import { useAuthStore } from '../store';

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    initials: 'ZK',
    title: 'Zeynep Kaya yeni bir içerik yayınladı',
    body: '"Güncel Ekonomi Gazetesi - 21 Nisan" şimdi yayında.',
    time: '10 dk önce',
  },
  {
    id: 2,
    initials: 'AD',
    title: 'Ayşe Demir yeni bir bölüm ekledi',
    body: 'İleri React Teknikleri kursuna yeni modül eklendi.',
    time: '2 saat önce',
  },
  {
    id: 3,
    initials: 'CÖ',
    title: 'Can Özdemir bir podcast yayınladı',
    body: 'Haftalık Teknoloji Podcast bu haftaki bölümüyle yayında.',
    time: 'Dün',
  },
];

export default function App() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [activePage, setActivePage] = useState('discovery');
  const [activeCategory] = useState<'all'>('all');
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authPanel, setAuthPanel] = useState<'login' | 'signup' | null>(null);

  // Bounce non-admins out of the admin route — defence-in-depth route guard.
  useEffect(() => {
    if (activePage === 'admin' && !isAdmin) {
      setActivePage('discovery');
    }
  }, [activePage, isAdmin]);

  // Auto-close the auth modal once the user is authenticated.
  useEffect(() => {
    if (user) setAuthPanel(null);
  }, [user]);

  const handleContentClick = (contentId: number) => {
    setSelectedContentId(contentId);
  };

  const handleBackFromContent = () => {
    setSelectedContentId(null);
  };

  // Any navigation that changes the main route (Sidebar, UserMenu, etc.) must
  // also tear down the ContentDetail overlay — otherwise it stays mounted on
  // top of the new page (the "ghost overlay" bug). This mirrors what a real
  // router would do when leaving `/content/:id`.
  const handleNavigate = (page: string) => {
    setSelectedContentId(null);
    setActivePage(page);
  };

  const renderPage = () => {
    if (selectedContentId !== null) {
      return (
        <ContentDetail
          contentId={selectedContentId}
          onBack={handleBackFromContent}
          onContentClick={handleContentClick}
        />
      );
    }

    if (activePage.startsWith('creator-')) {
      const creatorId = parseInt(activePage.split('-')[1]);
      return <CreatorProfile creatorId={creatorId} onContentClick={handleContentClick} />;
    }

    switch (activePage) {
      case 'discovery':
        return <ContentDiscovery activeCategory={activeCategory} onContentClick={handleContentClick} searchQuery={searchQuery} />;
      case 'pricing':
        return <PricingCheckout onSuccess={() => setActivePage('settings')} />;
      case 'admin':
        if (!isAdmin) {
          return <ContentDiscovery activeCategory={activeCategory} onContentClick={handleContentClick} searchQuery={searchQuery} />;
        }
        return <AdminDashboard />;
      case 'creator':
        return <CreatorStudio />;
      case 'settings':
        return <UserSettings />;
      case 'liked':
        return <LikedContent onContentClick={handleContentClick} />;
      case 'offline':
        return <OfflineContent onContentClick={handleContentClick} />;
      default:
        return <ContentDiscovery activeCategory={activeCategory} onContentClick={handleContentClick} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="size-full flex flex-col bg-[#0F172A]">
      <Toaster theme="dark" position="top-right" richColors closeButton />

      <nav className="h-16 bg-[#0F172A] border-b border-white/5 flex items-center px-6 gap-6">
        <div className="w-64 flex-shrink-0 px-6">
          <button
            onClick={() => {
              setActivePage('discovery');
              setSelectedContentId(null);
            }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            SOCHEN
          </button>
        </div>

        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-sm"></div>
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="İçerik ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Bildirimler"
                    className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Bell className="text-white" size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400"></span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="w-80 p-0 bg-[#1a2332] border border-white/10 text-white"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-semibold text-white">Bildirimler</p>
                    <p className="text-xs text-gray-400">
                      {DUMMY_NOTIFICATIONS.length} yeni bildirim
                    </p>
                  </div>
                  <div className="max-h-80 overflow-auto py-1">
                    {DUMMY_NOTIFICATIONS.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                          {notification.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-indigo-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-white/10">
                    <button
                      type="button"
                      className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors py-1"
                    >
                      Tümünü görüntüle
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <UserMenu onNavigate={handleNavigate} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuthPanel('login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 transition-colors"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setAuthPanel('signup')}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:shadow-lg hover:shadow-indigo-500/40 transition-all"
              >
                Kayıt Ol
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onNavigate={handleNavigate} activePage={activePage} />
        <div className="flex-1 flex flex-col overflow-hidden">{renderPage()}</div>
      </div>

      {authPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-auto"
          onClick={() => setAuthPanel(null)}
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthPanel(null)}
              aria-label="Kapat"
              className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
            <LoginScreen
              initialMode={authPanel}
              onLogin={() => setAuthPanel(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
