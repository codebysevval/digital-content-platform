import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
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
import { OwnProfile } from './components/OwnProfile';
import { OfflineContent } from './components/OfflineContent';
import { ContentDetail } from './components/ContentDetail';
import { LoginScreen } from './components/LoginScreen';
import { PaymentMethodUpdate } from './components/PaymentMethodUpdate';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover';
import { useAuthStore, useNotificationStore } from '../store';
import { resolveMediaUrl } from '../lib/api';

function pageToPath(page: string): string {
  const paths: Record<string, string> = {
    discovery: '/',
    pricing: '/pricing',
    admin: '/admin',
    creator: '/studio',
    settings: '/settings',
    liked: '/liked',
    offline: '/offline',
    'own-profile': '/profile/me',
    'payment-method': '/payment-method',
  };
  if (page in paths) return paths[page];
  const creatorMatch = page.match(/^creator-(\d+)$/);
  if (creatorMatch) return `/creator/${creatorMatch[1]}`;
  return '/';
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  const isAdmin = user?.role === 'admin';

  const notifications = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markNotifRead = useNotificationStore((s) => s.markRead);

  const [notifOpen, setNotifOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [activeCategory] = useState<'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authPanel, setAuthPanel] = useState<'login' | 'signup' | null>(null);

  // Parse content/creator IDs from URL
  const contentMatch = pathname.match(/^\/content\/(\d+)$/);
  const selectedContentId = contentMatch ? parseInt(contentMatch[1]) : null;
  const creatorMatch = pathname.match(/^\/creator\/(\d+)$/);
  const creatorId = creatorMatch ? parseInt(creatorMatch[1]) : null;

  // Derive active page name for sidebar highlighting
  const activePage = (() => {
    if (selectedContentId !== null) return 'content-detail';
    if (creatorId !== null) return `creator-${creatorId}`;
    if (pathname === '/profile/me') return 'own-profile';
    const pageMap: Record<string, string> = {
      '/': 'discovery',
      '/pricing': 'pricing',
      '/admin': 'admin',
      '/studio': 'creator',
      '/settings': 'settings',
      '/liked': 'liked',
      '/offline': 'offline',
      '/payment-method': 'payment-method',
    };
    return pageMap[pathname] ?? 'discovery';
  })();

  useEffect(() => {
    const token = localStorage.getItem('sochen_token');
    if (token) {
      void fetchCurrentUser().catch(() => {});
    }
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!user) return;
    void fetchNotifications();
    const id = setInterval(() => { void fetchNotifications(); }, 60_000);
    return () => clearInterval(id);
  }, [user, fetchNotifications]);

  // Route guard: non-admins cannot access /admin
  useEffect(() => {
    if (pathname === '/admin' && !isAdmin) {
      navigate('/');
    }
  }, [pathname, isAdmin, navigate]);

  // Own profile & payment-method route guards: require login
  useEffect(() => {
    if ((pathname === '/profile/me' || pathname === '/payment-method') && !user) {
      navigate('/');
    }
  }, [pathname, user, navigate]);

  // Logged-out users should not stay on account-only routes (stale studio UI, etc.)
  useEffect(() => {
    if (user) return;
    const guestRestricted =
      pathname === '/studio' ||
      pathname === '/settings' ||
      pathname === '/liked' ||
      pathname === '/offline' ||
      pathname === '/admin';
    if (guestRestricted) {
      navigate('/', { replace: true });
    }
  }, [user, pathname, navigate]);

  // Auto-close the auth modal once the user is authenticated
  useEffect(() => {
    if (user) setAuthPanel(null);
  }, [user]);

  const handleNavigate = (page: string) => {
    navigate(pageToPath(page));
  };

  const handleContentClick = (contentId: number) => {
    navigate(`/content/${contentId}`);
  };

  const handleBackFromContent = () => {
    navigate(-1);
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

    if (creatorId !== null) {
      return <CreatorProfile creatorId={creatorId} onContentClick={handleContentClick} />;
    }

    if (pathname === '/profile/me') {
      return <OwnProfile onContentClick={handleContentClick} />;
    }

    switch (activePage) {
      case 'discovery':
        return (
          <ContentDiscovery
            activeCategory={activeCategory}
            onContentClick={handleContentClick}
            searchQuery={searchQuery}
          />
        );
      case 'pricing':
        return <PricingCheckout onSuccess={() => navigate('/settings')} />;
      case 'admin':
        if (!isAdmin) {
          return (
            <ContentDiscovery
              activeCategory={activeCategory}
              onContentClick={handleContentClick}
              searchQuery={searchQuery}
            />
          );
        }
        return <AdminDashboard />;
      case 'creator':
        return <CreatorStudio />;
      case 'settings':
        return <UserSettings />;
      case 'payment-method':
        return <PaymentMethodUpdate />;
      case 'liked':
        return <LikedContent onContentClick={handleContentClick} />;
      case 'offline':
        return <OfflineContent onContentClick={handleContentClick} />;
      default:
        return (
          <ContentDiscovery
            activeCategory={activeCategory}
            onContentClick={handleContentClick}
            searchQuery={searchQuery}
          />
        );
    }
  };

  return (
    <div className="size-full flex flex-col bg-[#0F172A]">
      <Toaster theme="dark" position="top-right" richColors closeButton />

      <nav className="h-16 bg-[#0F172A] border-b border-white/5 flex items-center px-6 gap-6">
        <div className="w-64 flex-shrink-0 px-6">
          <button
            onClick={() => navigate('/')}
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
              <Popover open={notifOpen} onOpenChange={(open) => {
                setNotifOpen(open);
                if (open) markNotifRead();
              }}>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Bildirimler"
                    className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Bell className="text-white" size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400" />
                    )}
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
                      {notifications.length === 0
                        ? 'Yeni bildirim yok'
                        : `${unreadCount > 0 ? unreadCount : notifications.length} bildirim`}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-auto py-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-6">
                        Takip ettiğiniz üreticilerden yeni içerik yok
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.contentId}
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(`/content/${n.contentId}`);
                          }}
                          className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                            {n.creatorAvatarUrl ? (
                              <img
                                src={resolveMediaUrl(n.creatorAvatarUrl) ?? ''}
                                alt={n.creatorName}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              n.creatorInitials
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {n.creatorName} yeni içerik yayınladı
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {n.contentTitle}
                            </p>
                            <p className="text-xs text-indigo-400 mt-1">{n.uploadedAt}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => { setNotifOpen(false); navigate('/'); }}
                        className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors py-1"
                      >
                        İçerik Keşfet
                      </button>
                    </div>
                  )}
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
