import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from './authSlice';

export default function SessionExpiredHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onSessionExpired = () => {
      dispatch(logout());
      if (location.pathname !== '/login') navigate('/login', { replace: true });
    };
    window.addEventListener('auth:session-expired', onSessionExpired);
    return () => window.removeEventListener('auth:session-expired', onSessionExpired);
  }, [dispatch, navigate, location.pathname]);

  return null;
}
