import { useNavigate } from 'react-router-dom';

export default function SettingsPageLayout({ title, desc, children }) {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z" />
        </svg>
        Kembali
      </button>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      {children}
    </div>
  );
}
