import { useNavigate } from 'react-router';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';

interface AccessDeniedProps {
  requiredRoles?: string[];
  currentRole?: string;
}

export function AccessDenied({ requiredRoles, currentRole }: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-white flex items-center justify-center p-4">
      <Card className="bg-white backdrop-blur-lg border-red-500/20 p-8 max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full">
          <Shield className="h-8 w-8 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-[#0D0D0D] mb-3">Access Denied</h2>
        <p className="text-[#6B7280] mb-6">
          You don't have permission to access this page.
        </p>

        {requiredRoles && requiredRoles.length > 0 && (
          <div className="mb-6 p-4 bg-[#F8F9FF] rounded-lg border border-[#E5E7EB]">
            <p className="text-sm text-[#9CA3AF] mb-2">Required Role(s):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {requiredRoles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-[#EDE9FE] text-[#5B4FE8] border border-[#5B4FE8]/30 rounded-full text-xs capitalize"
                >
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {currentRole && (
          <div className="mb-6">
            <p className="text-sm text-[#9CA3AF] mb-1">Your Current Role:</p>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-sm capitalize">
              {currentRole.replace('_', ' ')}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 border-[#E5E7EB] text-[#0D0D0D] hover:bg-[#F3F4F6]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-[#0D0D0D]"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
