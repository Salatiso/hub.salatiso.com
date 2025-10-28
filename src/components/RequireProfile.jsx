import { useContext, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import GuestContext from '../contexts/GuestContext';

const hasMinimalProfile = (profile) => {
  if (!profile) return false;
  const nameOk = typeof profile.fullName === 'string' && profile.fullName.trim().length > 0;
  const contactOk = (profile.email && profile.email.trim()) || (profile.phone && profile.phone.trim());
  const gpsOk = !!profile.consentGPS;
  return nameOk && contactOk && gpsOk;
};

const RequireProfile = ({ children }) => {
  const { guestData } = useContext(GuestContext);
  const location = useLocation();

  const ok = useMemo(() => hasMinimalProfile(guestData?.profile), [guestData?.profile]);
  if (!ok) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireProfile;
