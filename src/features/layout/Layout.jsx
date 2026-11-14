import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { fetchMe } from '../auth/authSlice';
import { fetchStores } from '../stores/storeSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMe());
      dispatch(fetchStores());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-page">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 flex justify-center px-4 py-6 lg:px-6 min-h-[calc(100vh-68px)]">
          <div className="w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
