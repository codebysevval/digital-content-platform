import { Mail, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store';
import { CreatorProfile } from './CreatorProfile';

interface OwnProfileProps {
  onContentClick?: (contentId: number) => void;
}

export function OwnProfile({ onContentClick }: OwnProfileProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  if (!user) return null;

  if (user.role === 'creator' || user.role === 'admin') {
    return <CreatorProfile creatorId={user.id} isOwnProfile onContentClick={onContentClick} />;
  }

  const initials = /^[A-Za-zÇĞİÖŞÜçğışöşü]/.test(user.avatarInitials ?? '')
    ? user.avatarInitials
    : user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Mail size={15} />
                {user.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-medium">
                Kullanıcı
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-gray-400 text-sm mb-4">
              İçerik üreticisi olmak ister misiniz? Hesap menüsünden başvurabilirsiniz.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <Settings size={16} />
              Profil Ayarlarına Git
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
