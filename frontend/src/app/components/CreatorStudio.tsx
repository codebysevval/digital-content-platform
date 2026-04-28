import { Upload, FileText, TrendingUp, Eye, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { useContentStore, useCreatorStudioStore } from '../../store';

export function CreatorStudio() {
  const stats = useCreatorStudioStore((s) => s.stats);
  const uploadProgress = useCreatorStudioStore((s) => s.uploadProgress);
  const isUploading = useCreatorStudioStore((s) => s.isUploading);
  const isPublishing = useCreatorStudioStore((s) => s.isLoading);
  const fetchStats = useCreatorStudioStore((s) => s.fetchStats);
  const startUpload = useCreatorStudioStore((s) => s.startUpload);
  const publishContent = useCreatorStudioStore((s) => s.publishContent);

  const topics = useContentStore((s) => s.topics);
  const fetchTopics = useContentStore((s) => s.fetchTopics);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubscriberOnly, setIsSubscriberOnly] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Video Kursu');
  const [topic, setTopic] = useState('software');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    void fetchStats();
    void fetchTopics();
  }, [fetchStats, fetchTopics]);

  const topicOptions = topics.filter((t) => t.id !== 'all');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void startUpload();
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDropzoneClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void startUpload();
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Video Kursu');
    setTopic('software');
    setDuration('');
    setIsSubscriberOnly(true);
  };

  const handlePublish = async () => {
    try {
      await publishContent({
        title,
        description,
        category,
        topic,
        duration,
        subscriberOnly: isSubscriberOnly,
      });
      toast.success('İçerik başarıyla yayınlandı');
      resetForm();
    } catch {
      toast.error('İçerik yayınlanamadı', {
        description: 'Lütfen tekrar deneyin.',
      });
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
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs.Content value="upload" className="h-full">
            <div className="max-w-6xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Yeni İçerik Yükle
                </h2>
                <p className="text-gray-400 mt-1">Bilginizi dünyayla paylaşın</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                      <FileText className="text-indigo-400" size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Toplam İçerik</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalContent}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Eye className="text-blue-400" size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    Toplam Görüntüleme
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalViews}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                      <TrendingUp className="text-orange-400" size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Etkileşim Oranı</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.engagementRate}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Medya Yükle</h3>

                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleDropzoneClick}
                  onKeyDown={handleDropzoneKeyDown}
                  className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.pdf,.mp3,.epub,video/mp4,application/pdf,audio/mpeg,application/epub+zip"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-indigo-400" size={32} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Dosyalarınızı buraya sürükleyip bırakın
                  </h4>
                  <p className="text-gray-400 mb-4">
                    veya bilgisayarınızdan seçmek için tıklayın
                  </p>
                  <p className="text-sm text-gray-500">
                    Desteklenen formatlar: MP4, PDF, MP3, EPUB
                  </p>
                </div>

                {isUploading && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Yükleniyor...
                      </span>
                      <span className="text-sm font-medium text-white">
                        %{uploadProgress}
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </Progress.Root>
                  </div>
                )}
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  İçerik Detayları
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      İçerik Başlığı
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Açıklayıcı bir başlık girin"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="İçeriğinizi açıklayın"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      İçerik Tipi
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option className="bg-white text-gray-900">
                        Video Kursu
                      </option>
                      <option className="bg-white text-gray-900">Podcast</option>
                      <option className="bg-white text-gray-900">Dergi</option>
                      <option className="bg-white text-gray-900">E-kitap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Konu
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {topicOptions.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          className="bg-white text-gray-900"
                        >
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Süre / Uzunluk
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="örn: 2 saat veya 50 sayfa"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      İçerik Erişim Seviyesi
                    </label>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSubscriberOnly
                              ? 'bg-indigo-600/20'
                              : 'bg-white/10'
                          }`}
                        >
                          <Users
                            className={
                              isSubscriberOnly
                                ? 'text-indigo-400'
                                : 'text-gray-500'
                            }
                            size={20}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            Sadece Site Aboneleri
                          </p>
                          <p className="text-sm text-gray-400">
                            {isSubscriberOnly
                              ? 'Sadece site aboneleri erişebilir'
                              : 'Herkes için ücretsiz'}
                          </p>
                        </div>
                      </div>
                      <Switch.Root
                        checked={isSubscriberOnly}
                        onCheckedChange={setIsSubscriberOnly}
                        className="w-12 h-6 bg-white/20 rounded-full relative data-[state=checked]:bg-indigo-600 transition-colors"
                      >
                        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[26px]" />
                      </Switch.Root>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => void handlePublish()}
                    disabled={isPublishing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isPublishing ? 'Yayınlanıyor...' : 'İçeriği Yayınla'}
                  </button>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="contents" className="h-full">
            <div className="max-w-6xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">İçeriklerim</h2>
                <p className="text-gray-400 mt-1">
                  Yayınlanmış içeriklerinizi görüntüleyin
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                      <FileText className="text-indigo-400" size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Toplam İçerik</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalContent}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Eye className="text-blue-400" size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    Toplam Görüntüleme
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalViews}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                      <TrendingUp className="text-orange-400" size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Etkileşim Oranı</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.engagementRate}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  İçerik Listesi
                </h3>
                <p className="text-gray-400 text-center py-12">
                  İçerikleriniz burada görünecek
                </p>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="earnings" className="h-full">
            <div className="max-w-6xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Kazançlar</h2>
                <p className="text-gray-400 mt-1">
                  Gelir raporlarınızı görüntüleyin
                </p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-indigo-400" size={24} />
                  <p className="text-lg font-semibold text-white">Aylık Kazanç</p>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  {stats.monthlyEarnings}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  İçerik görüntülenme bazlı
                </p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Gelir Geçmişi
                </h3>
                <p className="text-gray-400 text-center py-12">
                  Gelir detayları burada görünecek
                </p>
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
