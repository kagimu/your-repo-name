import { Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface LabMenuItemProps {
  isMobile?: boolean;
}

const LabMenuItem = ({ isMobile = false }: LabMenuItemProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has access to lab management
  const canAccessLab = user?.accountType === 'institution' && user?.featureFlags?.labManagementEnabled;

  if (!canAccessLab) return null;

  return (
    <button
      onClick={() => navigate('/dashboard/labs')}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-100 ${
        isMobile ? 'text-sm' : ''
      }`}
    >
      <Beaker className="w-5 h-5 text-teal-600" />
      <span className="font-medium">Lab Management</span>
    </button>
  );
};

export default LabMenuItem;
