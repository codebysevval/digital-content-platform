import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, X } from 'lucide-react';
import { useAuthStore } from '../../store';

interface LoginScreenProps {
  onLogin: () => void;
  initialMode?: 'login' | 'signup';
}

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#1a2332] border border-white/10 rounded-2xl p-8 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          Kullanım ve Gizlilik Politikası
        </h2>
        <p className="text-xs text-gray-500 mb-6">Son güncelleme: Mayıs 2026</p>

        <div className="space-y-5 text-sm text-gray-300 leading-relaxed">
          <section>
            <h3 className="font-semibold text-white mb-2">1. Hizmet Koşulları</h3>
            <p>
              SOCHEN platformunu kullanarak aşağıdaki koşulları kabul etmiş
              sayılırsınız. Platforma erişim için 18 yaşını doldurmuş olmanız
              gerekmektedir. Hesabınızı başkalarıyla paylaşmamalısınız.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2">2. Kişisel Verilerin Korunması</h3>
            <p>
              Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmektedir.
              Toplanan veriler; ad, e-posta adresi ve kullanım istatistikleridir.
              Bu veriler üçüncü taraflarla paylaşılmaz.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2">3. Çerezler</h3>
            <p>
              Platform; oturum yönetimi ve kullanıcı deneyimini iyileştirmek
              amacıyla çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri
              devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2">4. İçerik Hakları</h3>
            <p>
              Platforma yüklediğiniz içeriklerin telif hakları size aittir. Ancak
              SOCHEN'e söz konusu içerikleri platform üzerinde gösterme lisansı
              tanımış olursunuz.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2">5. Hesap Feshi</h3>
            <p>
              Kullanım koşullarını ihlal ettiğiniz tespit edilirse hesabınız
              önceden bildirim yapılmaksızın askıya alınabilir veya sonlandırılabilir.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2">6. İletişim</h3>
            <p>
              Gizlilik politikamız hakkında sorularınız için{' '}
              <span className="text-indigo-400">kvkk@sochen.com</span> adresine
              ulaşabilirsiniz.
            </p>
          </section>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Anladım, Kapat
        </button>
      </div>
    </div>
  );
}

export function LoginScreen({ onLogin, initialMode = 'login' }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signup({ name: username, email, password });
      } else {
        await login({ email, password });
      }
      onLogin();
    } catch {
      /* error stored in zustand */
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword({ email: forgotEmail });
      setForgotSent(true);
    } catch {
      /* error stored in zustand */
    }
  };

  if (isForgotPassword) {
    return (
      <div className="w-full">
        <div className="relative w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
              SOCHEN
            </h1>
            <p className="text-gray-400">Şifre Sıfırlama</p>
          </div>

          <div className="bg-[#1a2332] border border-white/5 rounded-2xl p-8">
            {forgotSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Mail size={32} className="text-green-400" />
                </div>
                <p className="text-white font-semibold text-lg">Bağlantı Gönderildi</p>
                <p className="text-gray-400 text-sm">
                  Şifre sıfırlama bağlantısı{' '}
                  <span className="text-indigo-400">{forgotEmail}</span> adresine
                  gönderildi. Lütfen e-posta kutunuzu kontrol edin.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-gray-400 text-sm mb-4">
                  Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Lütfen bekleyin...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setForgotSent(false);
                setForgotEmail('');
              }}
              className="mt-6 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft size={16} />
              Giriş ekranına dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPolicy && <PrivacyPolicyModal onClose={() => setShowPolicy(false)} />}

      <div className="w-full">
        <div className="relative w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
              SOCHEN
            </h1>
            <p className="text-gray-400">Premium İçerik Platformu</p>
          </div>

          <div className="bg-[#1a2332] border border-white/5 rounded-2xl p-8">
            <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isSignUp
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isSignUp
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Kayıt Ol
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Kullanıcı adınız"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Lütfen bekleyin...' : isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </form>
          </div>

          {isSignUp && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Kayıt olarak{' '}
              <button
                type="button"
                onClick={() => setShowPolicy(true)}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                Kullanım ve Gizlilik Politikası
              </button>
              'nı kabul etmiş olursunuz.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
