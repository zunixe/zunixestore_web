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

  useEffect(() => {
    const handleClick = () => {
      const dd = document.querySelector('.user-dropdown-open');
      if (dd) dd.classList.remove('user-dropdown-open');
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#eff3f8]">
      <Sidebar />
      <div className="ml-[280px] flex flex-col min-h-screen flex-1">
        <Topbar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
