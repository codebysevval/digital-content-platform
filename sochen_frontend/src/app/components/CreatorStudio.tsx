import {
  Upload,
  FileText,
  TrendingUp,
  Eye,
  DollarSign,
  Image,
  Paperclip,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Heart,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { useAuthStore, useContentStore, useCreatorStudioStore } from '../../store';
import { formatUploadDate } from '../../lib/formatters';
import { API_BASE_URL, resolveMediaUrl } from '../../lib/api';

/* ── helpers ── */
function UploadZone({
  label,
  sub,
  accept,
  icon: Icon,
  isUploading,
  progress,
  url,
  fileName,
  previewUrl,
  onFile,
}: {
  label: string;
  sub: string;
  accept: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isUploading: boolean;
  progress: number;
  url: string | null;
  fileName: string | null;
  previewUrl?: string | null;
  onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          url
            ? 'border-green-500/60 bg-green-500/5'
            : isUploading
            ? 'border-indigo-500/60 bg-indigo-500/5'
            : 'border-white/20 hover:border-indigo-500 hover:bg-indigo-500/10'
        }`}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
        {url ? (
          previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={previewUrl} alt="Preview" className="max-h-24 max-w-full rounded-lg object-cover" />
              <div className="flex items-center gap-1">
                <CheckCircle2 className="text-green-400" size={16} />
                <span className="text-green-400 text-xs font-medium">Yüklendi</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={22} />
                <span className="text-green-400 text-sm font-medium">Yüklendi</span>
              </div>
              {fileName && (
                <span className="text-gray-400 text-xs truncate max-w-full px-2">{fileName}</span>
              )}
            </div>
          )
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-1">
            <Icon size={28} className="text-indigo-400 mx-auto mb-1 animate-pulse" />
            {fileName && (
              <span className="text-gray-300 text-xs truncate max-w-full px-2">{fileName}</span>
            )}
          </div>
        ) : (
          <>
            <Icon size={28} className="text-indigo-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-gray-500 text-xs mt-1">{sub}</p>
          </>
        )}
      </div>
      {isUploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Yükleniyor...</span>
            <span>%{progress}</span>
          </div>
          <Progress.Root className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <Progress.Indicator
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </Progress.Root>
        </div>
      )}
    </div>
  );
}

/* ── main component ── */
export function CreatorStudio() {
  const stats = useCreatorStudioStore((s) => s.stats);
  const mediaUpload = useCreatorStudioStore((s) => s.mediaUpload);
  const thumbnailUpload = useCreatorStudioStore((s) => s.thumbnailUpload);
  const attachmentUpload = useCreatorStudioStore((s) => s.attachmentUpload);
  const isPublishing = useCreatorStudioStore((s) => s.isLoading);
  const myContent = useCreatorStudioStore((s) => s.myContent);

  const earningsHistory = useCreatorStudioStore((s) => s.earningsHistory);
  const followers = useCreatorStudioStore((s) => s.followers);

  const fetchStats = useCreatorStudioStore((s) => s.fetchStats);
  const uploadMedia = useCreatorStudioStore((s) => s.uploadMedia);
  const uploadThumbnail = useCreatorStudioStore((s) => s.uploadThumbnail);
  const uploadAttachment = useCreatorStudioStore((s) => s.uploadAttachment);
  const clearUploads = useCreatorStudioStore((s) => s.clearUploads);
  const publishContent = useCreatorStudioStore((s) => s.publishContent);
  const fetchMyContent = useCreatorStudioStore((s) => s.fetchMyContent);
  const updateContent = useCreatorStudioStore((s) => s.updateContent);
  const deleteContent = useCreatorStudioStore((s) => s.deleteContent);
  const fetchEarningsHistory = useCreatorStudioStore((s) => s.fetchEarningsHistory);
  const fetchFollowers = useCreatorStudioStore((s) => s.fetchFollowers);

  const topics = useContentStore((s) => s.topics);
  const fetchTopics = useContentStore((s) => s.fetchTopics);

  const [isSubscriberOnly, setIsSubscriberOnly] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('COURSES');
  const [topic, setTopic] = useState('software');
  const [duration, setDuration] = useState('');

  /* edit/delete state */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTopic, setEditTopic] = useState('software');
  const [editCategory, setEditCategory] = useState('COURSES');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState<string | null>(null);
  const [editThumbnailUploading, setEditThumbnailUploading] = useState(false);
  const editThumbnailRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [followerSearch, setFollowerSearch] = useState('');

  const studioUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!studioUserId) return;
    void fetchStats();
    void fetchTopics();
    void fetchMyContent();
    void fetchEarningsHistory();
    void fetchFollowers();
  }, [
    studioUserId,
    fetchStats,
    fetchTopics,
    fetchMyContent,
    fetchEarningsHistory,
    fetchFollowers,
  ]);

  // Auto-populate duration when PDF page count arrives from backend
  useEffect(() => {
    if (mediaUpload.pageCount) {
      setDuration(`${mediaUpload.pageCount} sayfa`);
    }
  }, [mediaUpload.pageCount]);

  const topicOptions = topics.filter((t) => t.id !== 'all');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('COURSES');
    setTopic('software');
    setDuration('');
    setIsSubscriberOnly(true);
    clearUploads();
  };

  const extractMediaDuration = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const el = document.createElement(
        file.type.startsWith('video/') ? 'video' : 'audio',
      ) as HTMLMediaElement;
      el.preload = 'metadata';
      el.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const totalSecs = Math.round(el.duration || 0);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        if (h > 0) resolve(`${h} sa ${m} dk`);
        else if (m > 0) resolve(`${m} dk ${s} sn`);
        else resolve(`${s} sn`);
      };
      el.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };
      el.src = objectUrl;
    });

  const canPublish =
    !!mediaUpload.url &&
    !!thumbnailUpload.url &&
    !!title.trim() &&
    !!description.trim() &&
    !!duration.trim();

  const handlePublish = async () => {
    if (!canPublish) {
      toast.error('Lütfen tüm zorunlu alanları doldurun', {
        description: 'Medya dosyası ve kapak fotoğrafı zorunludur.',
      });
      return;
    }
    try {
      await publishContent({
        title,
        description,
        category,
        topic,
        duration,
        subscriberOnly: isSubscriberOnly,
      });
      toast.success('İçerik incelemeye gönderildi');
      resetForm();
    } catch {
      toast.error('İçerik yayınlanamadı', { description: 'Lütfen tekrar deneyin.' });
    }
  };

  const handleEditStart = (item: { id: number; title: string; description: string; topic?: string | null; category?: string | null }) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditTopic(item.topic ?? 'software');
    setEditCategory(item.category ? item.category.toUpperCase() : 'COURSES');
    setEditThumbnailUrl(null);
    setDeletingId(null);
  };

  const handleEditThumbnailChange = async (file: File) => {
    setEditThumbnailUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE_URL}/api/studio/upload/thumbnail`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sochen_token') ?? ''}` },
        body: form,
      });
      if (!res.ok) throw new Error('Yükleme başarısız');
      const data = (await res.json()) as { url: string };
      setEditThumbnailUrl(data.url);
    } catch {
      toast.error('Kapak görseli yüklenemedi');
    } finally {
      setEditThumbnailUploading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    try {
      await updateContent(editingId, {
        title: editTitle,
        description: editDesc,
        ...(editThumbnailUrl ? { thumbnailUrl: editThumbnailUrl } : {}),
        topic: editTopic,
        category: editCategory,
      });
      toast.success('İçerik güncellendi');
      setEditingId(null);
      setEditThumbnailUrl(null);
    } catch {
      toast.error('Güncelleme başarısız', { description: 'Lütfen tekrar deneyin.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteContent(deletingId);
      toast.success('İçerik silindi');
      setDeletingId(null);
    } catch {
      toast.error('Silme başarısız', { description: 'Lütfen tekrar deneyin.' });
    }
  };

  return (
    <div className="h-full bg-[#0F172A]">
      <Tabs.Root defaultValue="upload" className="h-full flex flex-col">
        <div className="bg-[#1a2332] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8">
            <Tabs.List className="flex gap-4 pt-6">
              <Tabs.Trigger
                value="upload"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                İçerik Yükle
              </Tabs.Trigger>
              <Tabs.Trigger
                value="contents"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                İçeriklerim
              </Tabs.Trigger>
              <Tabs.Trigger
                value="earnings"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Kazançlar
              </Tabs.Trigger>
              <Tabs.Trigger
                value="followers"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Takipçilerim
              </Tabs.Trigger>
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* ── İçerik Yükle ── */}
          <Tabs.Content value="upload" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Yeni İçerik Yükle</h2>
                <p className="text-gray-400 mt-1">Bilginizi dünyayla paylaşın</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <FileText className="text-indigo-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Toplam İçerik</p>
                  <p className="text-2xl font-bold text-white">{stats.totalContent}</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <Eye className="text-blue-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Toplam Görüntüleme</p>
                  <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <TrendingUp className="text-orange-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Etkileşim Oranı</p>
                  <p className="text-2xl font-bold text-white">{stats.engagementRate}</p>
                </div>
              </div>

              {/* File uploads */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-7 mb-6 space-y-5">
                <h3 className="text-lg font-bold text-white">Dosyalar</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medya Dosyası <span className="text-red-400">*</span>
                  </label>
                  <UploadZone
                    label="Video, ses veya PDF dosyasını sürükleyip bırakın"
                    sub="MP4, MP3, PDF desteklenir"
                    accept=".mp4,.mp3,.pdf,video/mp4,audio/mpeg,application/pdf"
                    icon={Upload}
                    isUploading={mediaUpload.isUploading}
                    progress={mediaUpload.progress}
                    url={mediaUpload.url}
                    fileName={mediaUpload.fileName}
                    onFile={async (f) => {
                      if (f.type.startsWith('video/') || f.type.startsWith('audio/')) {
                        const extracted = await extractMediaDuration(f);
                        if (extracted) setDuration(extracted);
                      }
                      uploadMedia(f).catch((err: Error) =>
                        toast.error(err.message, { description: 'Lütfen tekrar deneyin.' }),
                      );
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kapak Fotoğrafı <span className="text-red-400">*</span>
                  </label>
                  <UploadZone
                    label="Kapak görselini sürükleyip bırakın"
                    sub="JPG, PNG, WEBP — en fazla 5 MB"
                    accept="image/jpeg,image/png,image/webp"
                    icon={Image}
                    isUploading={thumbnailUpload.isUploading}
                    progress={thumbnailUpload.progress}
                    url={thumbnailUpload.url}
                    fileName={thumbnailUpload.fileName}
                    previewUrl={thumbnailUpload.url ? resolveMediaUrl(thumbnailUpload.url) : null}
                    onFile={(f) => {
                      void uploadThumbnail(f).catch((err: Error) =>
                        toast.error(err.message, { description: 'Lütfen tekrar deneyin.' }),
                      );
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ek Dosyalar <span className="text-gray-500 font-normal">(İsteğe Bağlı)</span>
                  </label>
                  <UploadZone
                    label="ZIP veya ek materyaller"
                    sub="Ödev, kaynak kodu, slayt vb."
                    accept=".zip,.rar,application/zip"
                    icon={Paperclip}
                    isUploading={attachmentUpload.isUploading}
                    progress={attachmentUpload.progress}
                    url={attachmentUpload.url}
                    fileName={attachmentUpload.fileName}
                    onFile={(f) => {
                      void uploadAttachment(f).catch((err: Error) =>
                        toast.error(err.message, { description: 'Lütfen tekrar deneyin.' }),
                      );
                    }}
                  />
                </div>
              </div>

              {/* Content details */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-7 mb-6">
                <h3 className="text-lg font-bold text-white mb-5">İçerik Detayları</h3>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Başlık <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Açıklayıcı bir başlık girin"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Açıklama <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="İçeriğinizi açıklayın"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        İçerik Tipi
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="COURSES" className="bg-[#1a2332]">Video</option>
                        <option value="PODCASTS" className="bg-[#1a2332]">Podcast</option>
                        <option value="MAGAZINES" className="bg-[#1a2332]">Dergi</option>
                        <option value="EBOOKS" className="bg-[#1a2332]">E-kitap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Konu
                      </label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {topicOptions.map((t) => (
                          <option key={t.id} value={t.id} className="bg-[#1a2332]">
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Süre / Uzunluk
                      </label>
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 min-h-[46px]">
                        {duration ? (
                          <>
                            <CheckCircle2 className="text-green-400 flex-shrink-0" size={15} />
                            <span className="text-white text-sm">{duration}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">Dosya seçildiğinde otomatik algılanır</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSubscriberOnly ? 'bg-indigo-600/20' : 'bg-white/10'}`}>
                        {isSubscriberOnly
                          ? <Lock className="text-indigo-400" size={18} />
                          : <Unlock className="text-gray-400" size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Sadece Aboneler</p>
                        <p className="text-xs text-gray-400">
                          {isSubscriberOnly ? 'Yalnızca aktif aboneler erişebilir' : 'Herkes ücretsiz erişebilir'}
                        </p>
                      </div>
                    </div>
                    <Switch.Root
                      checked={isSubscriberOnly}
                      onCheckedChange={setIsSubscriberOnly}
                      className="w-11 h-6 bg-white/20 rounded-full relative data-[state=checked]:bg-indigo-600 transition-colors"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-6" />
                    </Switch.Root>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <button
                    onClick={() => void handlePublish()}
                    disabled={isPublishing || !canPublish}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3.5 rounded-lg font-semibold text-base hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isPublishing ? 'Gönderiliyor...' : 'İncelemeye Gönder'}
                  </button>
                  {!canPublish && !isPublishing && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Medya dosyası, kapak fotoğrafı, başlık ve açıklama zorunludur; süre dosyadan otomatik algılanır
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* ── İçeriklerim ── */}
          <Tabs.Content value="contents" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">İçeriklerim</h2>
                <p className="text-gray-400 mt-1">Yayındaki içeriklerinizi yönetin</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <FileText className="text-indigo-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Toplam İçerik</p>
                  <p className="text-2xl font-bold text-white">{stats.totalContent}</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <Eye className="text-blue-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Toplam Görüntüleme</p>
                  <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <TrendingUp className="text-orange-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Etkileşim Oranı</p>
                  <p className="text-2xl font-bold text-white">{stats.engagementRate}</p>
                </div>
              </div>

              {myContent.length === 0 ? (
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-12 text-center">
                  <FileText className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-lg font-medium text-gray-400">Henüz yayında içeriğiniz yok</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Yüklediğiniz içerikler moderasyon onayından sonra burada görünecek
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myContent.map((item) => (
                    <div key={item.id} className="bg-[#1a2332] rounded-xl border border-white/10 overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{item.views.toLocaleString('tr-TR')} görüntülenme</span>
                            {(item.likeCount ?? 0) > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Heart size={10} className="text-red-400" />
                                  {(item.likeCount ?? 0).toLocaleString('tr-TR')} beğeni
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>{item.duration}</span>
                            <span>•</span>
                            <span>{formatUploadDate(item.uploadDate)}</span>
                            {item.subscriberOnly && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-indigo-400">
                                  <Lock size={10} />
                                  Premium
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              editingId === item.id
                                ? setEditingId(null)
                                : handleEditStart(item)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
                          >
                            {editingId === item.id ? (
                              <>
                                <ChevronUp size={14} />
                                Kapat
                              </>
                            ) : (
                              <>
                                <Pencil size={14} />
                                Düzenle
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(deletingId === item.id ? null : item.id);
                              setEditingId(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                          >
                            {deletingId === item.id ? (
                              <>
                                <ChevronUp size={14} />
                                Kapat
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Sil
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {editingId === item.id && (
                        <div className="border-t border-white/10 bg-white/3 p-4 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Başlık</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Açıklama</label>
                            <textarea
                              rows={3}
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">İçerik Tipi</label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="COURSES" className="bg-[#1a2332]">Video</option>
                                <option value="PODCASTS" className="bg-[#1a2332]">Podcast</option>
                                <option value="MAGAZINES" className="bg-[#1a2332]">Dergi</option>
                                <option value="EBOOKS" className="bg-[#1a2332]">E-kitap</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">Konu</label>
                              <select
                                value={editTopic}
                                onChange={(e) => setEditTopic(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {topicOptions.map((t) => (
                                  <option key={t.id} value={t.id} className="bg-[#1a2332]">
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Kapak Görseli (isteğe bağlı)</label>
                            <input
                              ref={editThumbnailRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void handleEditThumbnailChange(f);
                              }}
                            />
                            <div
                              onClick={() => editThumbnailRef.current?.click()}
                              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                            >
                              {editThumbnailUrl ? (
                                <img
                                  src={resolveMediaUrl(editThumbnailUrl)}
                                  alt="önizleme"
                                  className="w-16 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-10 bg-white/5 rounded flex items-center justify-center">
                                  <Image size={16} className="text-gray-500" />
                                </div>
                              )}
                              <span className="text-xs text-gray-400">
                                {editThumbnailUploading
                                  ? 'Yükleniyor...'
                                  : editThumbnailUrl
                                  ? 'Görsel seçildi — değiştirmek için tıkla'
                                  : 'Yeni kapak görseli seç'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => void handleEditSave()}
                              disabled={!editTitle.trim() || !editDesc.trim()}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save size={14} />
                              Kaydet
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                            >
                              <X size={14} />
                              İptal
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Inline delete confirm */}
                      {deletingId === item.id && (
                        <div className="border-t border-red-500/20 bg-red-500/5 p-4">
                          <p className="text-sm text-red-300 mb-3">
                            <strong>"{item.title}"</strong> kalıcı olarak silinecek. Emin misiniz?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => void handleDeleteConfirm()}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                              Evet, Sil
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                            >
                              <X size={14} />
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* ── Kazançlar ── */}
          <Tabs.Content value="earnings" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Kazançlar</h2>
                <p className="text-gray-400 mt-1">Gelir raporlarınızı görüntüleyin</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <DollarSign className="text-green-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Bu Ay</p>
                  <p className="text-3xl font-bold text-white">{stats.monthlyEarnings}</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <TrendingUp className="text-indigo-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Toplam Kazanç</p>
                  <p className="text-3xl font-bold text-white">{stats.totalEarnings}</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-5">
                  <Eye className="text-blue-400 mb-2" size={20} />
                  <p className="text-xs text-gray-400">Toplam Görüntüleme</p>
                  <p className="text-3xl font-bold text-white">{stats.totalViews}</p>
                </div>
              </div>

              {/* Monthly earnings bar chart */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6 mb-6">
                <h3 className="text-base font-semibold text-white mb-4">Aylık Kazanç Grafiği</h3>
                {earningsHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <DollarSign className="text-indigo-600/40 mb-3" size={36} />
                    <p className="text-sm text-gray-500">Henüz kazanç verisi bulunmuyor</p>
                    <p className="text-xs text-gray-600 mt-1">İzleyiciler içeriklerinizi izledikçe grafiğiniz dolacak</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-2 h-36">
                      {(() => {
                        const maxAmt = Math.max(...earningsHistory.map((e) => e.amount), 0.0001);
                        return earningsHistory.map((entry) => (
                          <div key={entry.month} className="flex flex-col items-center flex-1 min-w-0">
                            <span className="text-[10px] text-gray-500 mb-1 truncate w-full text-center">
                              ₺{Number(entry.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div
                              className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all"
                              style={{ height: `${Math.max((entry.amount / maxAmt) * 100, 4)}%` }}
                            />
                            <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">{entry.month}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Per-content earnings table */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                <h3 className="text-base font-semibold text-white mb-4">İçerik Bazlı Görüntülenme</h3>
                {myContent.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Yayında içerik bulunmuyor
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">İçerik</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Görüntülenme</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Kazanç</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myContent.map((item) => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 text-white font-medium truncate max-w-xs">{item.title}</td>
                            <td className="py-3 px-4 text-gray-400 text-right">
                              {item.views.toLocaleString('tr-TR')}
                            </td>
                            <td className="py-3 px-4 text-green-400 text-right text-xs font-medium">
                              {item.earnings ?? '₺0,00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="followers" className="h-full">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="bg-[#1a2332] rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Takipçilerim</h3>
                    <p className="text-gray-400 text-sm mt-1">{followers.length} takipçi</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Takipçi ara..."
                      value={followerSearch}
                      onChange={(e) => setFollowerSearch(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-56"
                    />
                  </div>
                </div>
                {followers.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Users size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Henüz takipçiniz yok.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {followers
                      .filter((f) =>
                        followerSearch.trim() === '' ||
                        f.name.toLowerCase().includes(followerSearch.toLowerCase()),
                      )
                      .map((f) => (
                        <div key={f.userId} className="flex items-center gap-4 py-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                            {f.avatarUrl ? (
                              <img src={f.avatarUrl} alt={f.name} className="w-full h-full object-cover" />
                            ) : (
                              f.avatarInitials
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{f.name}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(f.followedAt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })} tarihinde takip etti
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
