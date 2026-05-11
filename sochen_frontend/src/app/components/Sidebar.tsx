import { Heart, User, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore, useCreatorStore } from '../../store';
import { resolveMediaUrl } from '../../lib/api';
import { getAvatarInitials } from '../../lib/formatters';

interface SidebarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export function Sidebar({ onNavigate, activePage }: SidebarProps) {
  const [isFollowingExpanded, setIsFollowingExpanded] = useState(true);
  const userId = useAuthStore((s) => s.user?.id);
  const followedCreators = useCreatorStore((s) => s.followedCreators);
  const fetchFollowedCreators = useCreatorStore((s) => s.fetchFollowedCreators);

  useEffect(() => {
    if (!userId) return;
    void fetchFollowedCreators();
  }, [userId, fetchFollowedCreators]);

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/5 h-full flex flex-col">
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <button
              onClick={() => setIsFollowingExpanded(!isFollowingExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <User size={20} />
                <span className="font-medium">Takip Edilenler</span>
              </div>
              {isFollowingExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {isFollowingExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {followedCreators.map((creator) => (
                  <button
                    key={creator.id}
                    onClick={() => onNavigate(`creator-${creator.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                      {creator.avatar && creator.avatar.startsWith('/uploads/') ? (
                        <img
                          src={resolveMediaUrl(creator.avatar)}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getAvatarInitials(creator.name, creator.avatar)
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{creator.name}</p>
                      <p className="text-xs text-gray-500">{creator.followers} Takipçi</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('liked')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'liked'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <Heart size={20} />
            <span className="font-medium">Beğenilen İçerikler</span>
          </button>

          <button
            onClick={() => onNavigate('offline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'offline'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <Download size={20} />
            <span className="font-medium">Çevrimdışı İçerikler</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
