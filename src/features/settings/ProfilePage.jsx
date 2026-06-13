import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res.json();
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { stores } = useSelector((s) => s.stores);
  const isLoading = useSelector((s) => s.auth.isLoading);
  const [activeTab, setActiveTab] = useState('akun');
  const [form, setForm] = useState({ full_name: '', phone: '', avatar_url: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [avatarZoom, setAvatarZoom] = useState(false);
  const [modal, setModal] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  // WhatsApp verification
  const [waCode, setWaCode] = useState('');
  const [waCodeSent, setWaCodeSent] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [showWaInput, setShowWaInput] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleSave = () => {
    dispatch(updateProfile(form));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (json.data?.url) {
        const newForm = { ...form, avatar_url: json.data.url };
        setForm(newForm);
        dispatch(updateProfile(newForm));
        setUploadSuccess('Foto berhasil diupload');
      } else {
        setUploadError(json.message || 'Gagal upload foto');
      }
    } catch (err) {
      setUploadError('Gagal upload foto: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleVerifyPin = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiCall('/auth/pin/verify', {
        method: 'POST',
        body: JSON.stringify({ pin: pinInput }),
      });
      if (json.status === 'success') {
        setModal(null);
        setPinInput('');
      } else {
        setModalError(json.message || 'PIN salah');
      }
    } catch {
      setModalError('Gagal verifikasi PIN');
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      setModalError('PIN harus 4-6 digit');
      return;
    }
    if (newPin !== confirmPin) {
      setModalError('PIN tidak cocok');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiCall('/auth/pin', {
        method: 'POST',
        body: JSON.stringify({ old_pin: oldPin || undefined, new_pin: newPin }),
      });
      if (json.status === 'success') {
        setModal(null);
        setPinInput('');
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setModalError(json.message || 'Gagal mengubah PIN');
      }
    } catch {
      setModalError('Gagal mengubah PIN');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiCall('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });
      if (json.status === 'success') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setModalError(json.message || 'Gagal menghapus akun');
      }
    } catch {
      setModalError('Gagal menghapus akun');
    } finally {
      setModalLoading(false);
    }
  };

  const handleWaRequest = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiCall('/auth/phone/verify-request', {
        method: 'POST',
        body: JSON.stringify({ phone: form.phone }),
      });
      if (json.status === 'success') {
        setWaCodeSent(json.data.code);
        setWaPhone(json.data.phone);
        setShowWaInput(true);
      } else {
        setModalError(json.message || 'Gagal mengirim kode');
      }
    } catch {
      setModalError('Gagal mengirim kode');
    } finally {
      setModalLoading(false);
    }
  };

  const handleWaVerify = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiCall('/auth/phone/verify', {
        method: 'POST',
        body: JSON.stringify({ code: waCode, phone: waPhone }),
      });
      if (json.status === 'success') {
        setForm({ ...form, phone: json.data.phone });
        dispatch(updateProfile({ ...form, phone: json.data.phone }));
        setShowWaInput(false);
        setWaCode('');
        setWaCodeSent('');
      } else {
        setModalError(json.message || 'Kode salah');
      }
    } catch {
      setModalError('Gagal verifikasi');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setPinInput('');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setDeletePassword('');
    setModalError('');
    setShowWaInput(false);
    setWaCode('');
    setWaCodeSent('');
  };

  const openPinVerify = () => {
    setModal('pin-verify');
    setPinInput('');
    setModalError('');
  };

  const openPinChange = async () => {
    setModal('pin-change');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setModalError('');
    try {
      const json = await apiCall('/auth/pin/verify', { method: 'POST', body: JSON.stringify({ pin: '' }) });
      setHasPin(json.status === 'success');
    } catch {
      setHasPin(false);
    }
  };

  const openDeleteConfirm = () => {
    setModal('delete');
    setDeletePassword('');
    setModalError('');
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profil Saya</h2>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-100">
        <div className="flex items-center px-6 pt-4 gap-8">
          <button
            onClick={() => setActiveTab('akun')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'akun'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Akun
          </button>
          <button
            onClick={() => setActiveTab('toko')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'toko'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Toko Saya
            {stores?.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                {stores.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'akun' ? (
        <div className="bg-white rounded-b-xl shadow-sm">
          {/* Profile Photo & Form */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => form.avatar_url && setAvatarZoom(true)}
              >
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 font-semibold text-lg">
                    {(form.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? 'Mengupload...' : 'Upload'}
              </button>
            </div>
            {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
            {uploadSuccess && <p className="text-sm text-green-500 mt-2">{uploadSuccess}</p>}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Nama Lengkapmu (sesuai KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Phone Number with Verification */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={user?.phone_verified}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      user?.phone_verified ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {user?.phone_verified && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
                        </svg>
                        Terverifikasi
                      </span>
                    )}
                    {user?.phone_verified ? (
                      <button
                        onClick={openPinVerify}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        Ubah
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!form.phone) {
                            setModalError('Isi nomor HP terlebih dahulu');
                          } else {
                            setModalError('');
                            handleWaRequest();
                          }
                        }}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        Verifikasi
                      </button>
                    )}
                  </div>
                </div>
                {!user?.phone_verified && (
                  <p className="text-xs text-gray-500 mt-1">Verifikasi via WhatsApp diperlukan untuk mengamankan akun</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-6" />

          {/* PIN */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">PIN</h3>
            <p className="text-sm text-gray-500 mb-4">
              PIN membantu melindungi akun tokomu dan informasi pribadimu tetap aman.
            </p>
            <button
              onClick={openPinChange}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ubah PIN
            </button>
          </div>

          <div className="h-px bg-gray-100 mx-6" />

          {/* KTP */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Registrasi KTP</h3>
            <p className="text-sm text-gray-500 mb-4">
              Untuk alasan keamanan, kamu harus memverifikasi identitas (KTP) kamu sebelum dapat mengoperasikan tokomu sepenuhnya.
            </p>
            <div className={`rounded-lg px-4 py-3 flex items-center gap-2 ${user?.ktp_verified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              {user?.ktp_verified ? (
                <>
                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">Identitasmu telah diverifikasi</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-yellow-700 font-medium">Belum Diverifikasi</span>
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-6" />

          {/* Delete Account */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Akun</h3>
            <p className="text-sm text-gray-500 mb-1">
              Perlu diketahui bahwa penghapusan akan mengakibatkan hilangnya seluruh data dan profil Anda secara permanen di dalam toko, sehingga Anda tidak dapat mengakses admin toko setelahnya.
            </p>
            <p className="text-sm text-red-600 mb-4">Tindakan ini tidak dapat dibatalkan</p>
            <button
              onClick={openDeleteConfirm}
              className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Hapus Akun Saya
            </button>
          </div>

          <div className="h-px bg-gray-100 mx-6" />

          <div className="p-6 text-sm text-gray-500">
            <span>Syarat & Ketentuan</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-b-xl shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Toko Saya</h3>
              <a href="/stores/new" className="text-blue-600 text-sm font-medium hover:underline">
                + Tambah Toko
              </a>
            </div>
            {stores && stores.length > 0 ? (
              <div className="space-y-3">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {(store.name || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{store.name}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
                    </svg>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum ada toko. Buat toko baru.</p>
            )}
          </div>
          <div className="h-px bg-gray-100 mx-6" />
          <div className="p-6 text-sm text-gray-500">
            <span>Syarat & Ketentuan</span>
          </div>
        </div>
      )}

      {/* Modal - PIN Verify */}
      {modal === 'pin-verify' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Masukkan PIN</h3>
            <p className="text-sm text-gray-500 mb-4">Masukkan PIN untuk mengubah nomor HP</p>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-center text-lg tracking-[0.5em] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="• • • • • •"
              autoFocus
            />
            {modalError && <p className="text-sm text-red-500 mt-2">{modalError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                Batal
              </button>
              <button onClick={handleVerifyPin} disabled={modalLoading || !pinInput} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {modalLoading ? 'Memverifikasi...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - PIN Change */}
      {modal === 'pin-change' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Ubah PIN</h3>
            <p className="text-sm text-gray-500 mb-4">Masukkan PIN baru untuk akun Anda</p>
            <div className="space-y-3">
              {hasPin && (
                <input
                  type="password"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-center text-lg tracking-[0.5em] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PIN Lama"
                  autoFocus
                />
              )}
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-center text-lg tracking-[0.5em] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PIN Baru"
                autoFocus={!hasPin}
              />
              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-center text-lg tracking-[0.5em] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Konfirmasi PIN Baru"
              />
            </div>
            {modalError && <p className="text-sm text-red-500 mt-2">{modalError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                Batal
              </button>
              <button onClick={handleChangePin} disabled={modalLoading || !newPin || !confirmPin} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {modalLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - WhatsApp Verification */}
      {(showWaInput || waCodeSent) && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Verifikasi WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-4">
              Kode verifikasi telah dikirim ke {waPhone}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 font-medium">Kode: {waCodeSent}</p>
              <p className="text-xs text-green-600 mt-1">Masukkan kode di atas untuk verifikasi</p>
            </div>
            <input
              type="text"
              maxLength={6}
              value={waCode}
              onChange={(e) => setWaCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-center text-lg tracking-[0.5em] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="• • • • • •"
              autoFocus
            />
            {modalError && <p className="text-sm text-red-500 mt-2">{modalError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                Batal
              </button>
              <button onClick={handleWaVerify} disabled={modalLoading || !waCode} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {modalLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Lightbox */}
      {avatarZoom && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80"
          onClick={() => setAvatarZoom(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] p-2">
            <img
              src={form.avatar_url}
              alt="avatar zoom"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setAvatarZoom(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal - Delete Account */}
      {modal === 'delete' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Hapus Akun</h3>
            <p className="text-sm text-gray-500 mb-4">Masukkan password untuk menghapus akun Anda</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Password"
              autoFocus
            />
            {modalError && <p className="text-sm text-red-500 mt-2">{modalError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                Batal
              </button>
              <button onClick={handleDeleteAccount} disabled={modalLoading || !deletePassword} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {modalLoading ? 'Menghapus...' : 'Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
