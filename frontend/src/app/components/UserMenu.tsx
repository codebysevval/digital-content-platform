import {
  ChevronDown,
  Upload,
  ShieldCheck,
  Settings,
  LogOut,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store';
import type { UserMenuIconKey, UserMenuItem } from '../../types';

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
  const menuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getVisibleMenuItems = useAuthStore((s) => s.getVisibleMenuItems);

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
  };

  const visibleMenuItems: UserMenuItem[] = getVisibleMenuItems();

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-semibold">{user.avatarInitials}</span>
        </div>
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
  );
}
