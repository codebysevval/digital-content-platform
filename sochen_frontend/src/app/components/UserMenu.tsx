import {
  ChevronDown,
  Upload,
  ShieldCheck,
  Settings,
  LogOut,
  CreditCard,
  Star,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore, useCreatorApplicationStore } from '../../store';
import type { UserMenuIconKey, UserMenuItem } from '../../types';
import { getAvatarInitials } from '../../lib/formatters';
import { resolveMediaUrl } from '../../lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface UserMenuProps {
  onNavigate: (page: string) => void;
}

const ICON_MAP: Record<UserMenuIconKey, LucideIcon> = {
  creditCard: CreditCard,
  upload: Upload,
  shieldCheck: ShieldCheck,
  settings: Settings,
  logOut: LogOut,
};

const roleLabel = (role: string) =>
  role === 'admin'
    ? 'Yönetici'
    : role === 'creator'
      ? 'İçerik Üretici'
      : 'Kullanıcı';

export function UserMenu({ onNavigate }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [rationale, setRationale] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getVisibleMenuItems = useAuthStore((s) => s.getVisibleMenuItems);

  const myApplication = useCreatorApplicationStore((s) => s.myApplication);
  const myApplicationFetched = useCreatorApplicationStore((s) => s.myApplicationFetched);
  const submitApplication = useCreatorApplicationStore((s) => s.submitApplication);
  const fetchMyApplication = useCreatorApplicationStore((s) => s.fetchMyApplication);
  const isApplyLoading = useCreatorApplicationStore((s) => s.isLoading);

  useEffect(() => {
    if (user?.role === 'user') {
      void fetchMyApplication();
    }
  }, [user?.role, fetchMyApplication]);

  // Poll application status every 30 s while pending so the UI updates
  // when an admin approves without requiring the user to re-login.
  useEffect(() => {
    if (user?.role !== 'user' || myApplication?.status !== 'pending') return;
    const intervalId = setInterval(() => {
      void fetchMyApplication();
    }, 30_000);
    return () => clearInterval(intervalId);
  }, [user?.role, myApplication?.status, fetchMyApplication]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    onNavigate('discovery');
  };

  const handleApplyClick = () => {
    setIsOpen(false);
    setIsApplyDialogOpen(true);
  };

  const handleApplySubmit = async () => {
    try {
      await submitApplication(rationale);
      setApplySuccess(true);
      setRationale('');
    } catch {
      /* error displayed via store */
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsApplyDialogOpen(open);
    if (!open) {
      setRationale('');
      setApplySuccess(false);
    }
  };

  const visibleMenuItems: UserMenuItem[] = getVisibleMenuItems();

  if (!user) return null;

  const showApplyButton =
    user.role === 'user' &&
    myApplicationFetched &&
    myApplication?.status !== 'pending' &&
    myApplication?.status !== 'approved';

  const showPendingBadge = user.role === 'user' && myApplicationFetched && myApplication?.status === 'pending';

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {user.avatarUrl ? (
            <img
              src={resolveMediaUrl(user.avatarUrl)}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold">{getAvatarInitials(user.name, user.avatarInitials)}</span>
            </div>
          )}
          <div className="text-left">
            <p className="font-medium text-white text-sm">{user.name}</p>
            <p className="text-xs text-slate-300">{user.email}</p>
          </div>
          <ChevronDown
            className={`text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
            size={18}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-[#1a2332] rounded-lg shadow-xl border border-white/10 py-2 z-50">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <p className="text-xs text-indigo-400 mt-1 capitalize">
                {roleLabel(user.role)}
              </p>
            </div>

            {visibleMenuItems.map((item) => {
              const Icon = ICON_MAP[item.iconKey];
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <Icon className="text-gray-400" size={18} />
                  <span className="text-white">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => handleMenuClick('own-profile')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <User className="text-gray-400" size={18} />
              <span className="text-white">Profilimi Görüntüle</span>
            </button>

            {showApplyButton && (
              <button
                onClick={handleApplyClick}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <Star className="text-indigo-400" size={18} />
                <span className="text-white">İçerik Üreticisi Ol</span>
              </button>
            )}

            {showPendingBadge && (
              <div className="w-full flex items-center gap-3 px-4 py-3 cursor-default">
                <Star className="text-yellow-400 flex-shrink-0" size={18} />
                <span className="text-yellow-400 text-sm">Başvurunuz İncelemede</span>
              </div>
            )}

            <div className="border-t border-white/10 mt-2 pt-2">
              <button
                onClick={() => handleMenuClick('settings')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <Settings className="text-gray-400" size={18} />
                <span className="text-white">Profil Ayarları</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left text-red-400"
              >
                <LogOut className="text-red-400" size={18} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isApplyDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-[#1a2332] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              İçerik Üreticisi Başvurusu
            </DialogTitle>
          </DialogHeader>

          {applySuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Star size={30} className="text-green-400" />
              </div>
              <p className="text-white font-semibold text-lg">Başvurunuz Alındı!</p>
              <p className="text-gray-400 text-sm">
                Başvurunuz inceleniyor. Sonuç size bildirilecek.
              </p>
              <button
                onClick={() => handleDialogClose(false)}
                className="mt-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Tamam
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm">
                Ne tür içerikler üretmeyi planladığınızı, deneyimlerinizi ve platforma
                nasıl katkı sağlayacağınızı açıklayın.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Başvuru Gerekçeniz{' '}
                  <span className="text-gray-500">(en az 20 karakter)</span>
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value.slice(0, 2000))}
                  placeholder="Deneyimlerinizi, üretmeyi planladığınız içerik türlerini ve platforma katkılarınızı açıklayın..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <p className="text-right text-xs text-gray-500 mt-1">
                  {rationale.length}/2000
                </p>
              </div>

              <DialogFooter>
                <button
                  onClick={() => handleDialogClose(false)}
                  className="px-4 py-2 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => void handleApplySubmit()}
                  disabled={isApplyLoading || rationale.trim().length < 20}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isApplyLoading ? 'Gönderiliyor...' : 'Başvur'}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
