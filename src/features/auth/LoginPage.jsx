import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Truck, Tag, CreditCard, UserRound, AlertCircle, Loader2 } from 'lucide-react';
import { login, loginWithGoogle, loginWithFacebook, clearError } from './authSlice';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

function loadScript(src, { id, check }) {
  return new Promise((resolve, reject) => {
    if (check()) return resolve();
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Gagal memuat SDK')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Gagal memuat SDK'));
    document.head.appendChild(s);
  });
}

function loadGoogleIdentity(dispatch) {
  return loadScript('https://accounts.google.com/gsi/client', {
    id: 'google-gsi',
    check: () => !!window.google?.accounts?.id,
  }).then(() => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => dispatch(loginWithGoogle({ credential: resp.credential })),
    });
  });
}

function loadFacebookSdk() {
  return loadScript('https://connect.facebook.net/en_US/sdk.js', {
    id: 'facebook-jssdk',
    check: () => !!window.FB,
  }).then(() => {
    window.FB.init({ appId: FACEBOOK_APP_ID, cookie: false, xfbml: false, version: 'v21.0' });
  });
}

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2" aria-label="ZunixeStore">
      <span className="relative w-7 h-8" aria-hidden="true">
        <span className="absolute left-0 top-0 w-5 h-8 rounded-l-full bg-amber-400" />
        <span className="absolute left-2 top-0 w-5 h-6 rounded-r-full bg-primary" />
      </span>
      <span className="text-[30px] font-bold tracking-tight text-[#1b2140] leading-none">zunixe</span>
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

/* Ilustrasi sederhana: gelembung ikon bisnis di sekitar kartu profil. */
function Illustration() {
  const bubble = 'absolute rounded-full bg-white border-2 border-[#1b2140] flex items-center justify-center shadow-[3px_3px_0_#1b2140]';
  return (
    <div className="relative h-[300px] w-full max-w-[300px]" aria-hidden="true">
      <span className={`${bubble} w-14 h-14 left-2 top-6`}><Truck className="w-6 h-6 text-primary" /></span>
      <span className={`${bubble} w-16 h-16 left-[150px] top-0`}><Tag className="w-7 h-7 text-primary" /></span>
      <span className={`${bubble} w-12 h-12 left-0 top-[120px]`}><CreditCard className="w-5 h-5 text-primary" /></span>
      <span className="absolute right-0 top-[70px] w-16 h-20 rounded-lg bg-white border-2 border-[#1b2140] flex flex-col items-center justify-center gap-1.5">
        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><UserRound className="w-5 h-5 text-white" /></span>
        <span className="w-3 h-3 rounded-full bg-amber-400" />
      </span>
      <span className="absolute left-[60px] bottom-0 w-[170px] h-[150px] rounded-t-[90px] bg-primary border-2 border-[#1b2140]" />
      <span className="absolute left-[105px] bottom-[120px] w-20 h-20 rounded-full bg-white border-2 border-[#1b2140]" />
      <span className="absolute left-0 right-6 bottom-0 h-0.5 bg-[#1b2140]" />
    </div>
  );
}

const inputCls =
  'w-full h-[52px] px-3 rounded-lg border border-[#d4d7de] bg-white text-[15px] text-neutral placeholder:text-[#6b7280] ' +
  'transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const googleBtnRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((s) => s.auth);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return;
    loadGoogleIdentity(dispatch)
      .then(() => {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: googleBtnRef.current.clientWidth || 220,
        });
      })
      .catch(() => setOauthError('Gagal memuat login Google'));
  }, [dispatch]);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) return setOauthError('Login Google belum dikonfigurasi');
    loadGoogleIdentity(dispatch)
      .then(() => window.google.accounts.id.prompt())
      .catch(() => setOauthError('Gagal memuat login Google'));
  };

  const handleFacebookClick = () => {
    if (!FACEBOOK_APP_ID) return setOauthError('Login Facebook belum dikonfigurasi');
    setOauthError(null);
    loadFacebookSdk()
      .then(() => window.FB.login((resp) => {
        const token = resp?.authResponse?.accessToken;
        if (token) dispatch(loginWithFacebook({ accessToken: token }));
      }, { scope: 'email,public_profile' }))
      .catch(() => setOauthError('Gagal memuat login Facebook'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex bg-white font-label">
      {/* Panel kiri */}
      <aside className="hidden lg:flex w-[400px] shrink-0 flex-col justify-between bg-[#ecf0fc] px-12 pt-11 pb-9 sticky top-0 h-screen">
        <div>
          <Link to="/"><Wordmark /></Link>
          <p className="mt-11 text-[24px] font-semibold leading-[1.15] text-black">
            Satu tempat untuk semua kebutuhan bisnismu
          </p>
        </div>
        <Illustration />
      </aside>

      {/* Panel kanan */}
      <main className="flex-1 flex flex-col min-h-screen px-4 sm:px-14">
        <div className="flex items-center justify-between lg:justify-end pt-9 gap-4">
          <Link to="/" className="lg:hidden"><Wordmark /></Link>
          <p className="text-sm text-black">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary underline underline-offset-2 hover:text-primary-hover">Buat akun</Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-[480px]">
            <h1 className="text-[24px] font-semibold text-black leading-tight">Masuk ke ZunixeStore</h1>
            <p className="text-sm text-black mt-2.5">Sebelum melanjutkan ke dashboard toko...</p>

            {(error || oauthError) && (
              <div role="alert" className="mt-6 flex items-start gap-2 rounded-lg bg-danger-surface border border-red-200 px-3 py-2.5 text-sm text-danger">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error || oauthError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div>
                <label htmlFor="email" className="sr-only">Alamat email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="Alamat Email"
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">Kata sandi</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-12`}
                  placeholder="Kata Sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-md text-[#9ca3af] hover:text-neutral cursor-pointer"
                >
                  {showPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] rounded-lg bg-primary text-white text-base font-semibold shadow-[0_6px_14px_rgba(65,105,225,0.25)] transition-colors hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/forgot-password" className="text-sm text-primary underline underline-offset-2 hover:text-primary-hover">
                Lupa kata sandi?
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-[#d4d7de]" />
              <span className="text-sm text-[#6b7280]">atau</span>
              <div className="flex-1 h-px bg-[#d4d7de]" />
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 px-1.5">
              <div className="h-10 rounded-full bg-[#1a73e8] overflow-hidden flex items-center justify-center">
                {GOOGLE_CLIENT_ID ? (
                  <div ref={googleBtnRef} className="flex justify-center" />
                ) : (
                  <button type="button" onClick={handleGoogleClick} className="h-10 rounded-full bg-[#1a73e8] text-white text-sm font-medium flex items-center pl-0.5 pr-4 transition-opacity hover:opacity-90 cursor-pointer w-full justify-center">
                    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0"><GoogleIcon /></span>
                    <span className="flex-1 text-center">Masuk dengan Google</span>
                  </button>
                )}
              </div>
              <button type="button" onClick={handleFacebookClick} disabled={isLoading} className="h-10 rounded-full bg-[#1877f2] text-white text-sm font-semibold flex items-center pl-2.5 pr-4 transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer">
                <FacebookIcon />
                <span className="flex-1 text-center">Masuk dengan Facebook</span>
              </button>
            </div>

            <p className="mt-12 text-sm text-[#4b5563] text-center">
              Jika mengalami kendala,{' '}
              <a href="#" className="text-primary underline underline-offset-2">hubungi tim support</a> kami.
            </p>
          </div>
        </div>

        <p className="pb-9 text-sm text-[#4b5563] text-center">© ZunixeStore 2022-{new Date().getFullYear()}</p>
      </main>
    </div>
  );
}
