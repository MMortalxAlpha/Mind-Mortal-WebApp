
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { makeSpecificUserAdmin } from './AdminFunctions';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminSetup = () => {
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  const handleMakeAdmin = async () => {
    setLoading(true);
    try {
      const result = await makeSpecificUserAdmin();
      setResult(result);
      
      // Refresh the current user's profile if available
      await refreshProfile();
    } catch (error) {
      console.error('Error in admin setup:', error);
      setResult({
        success: false,
        message: 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
      <p className="mb-6">This page allows you to set up the initial admin user. Click the button below to make agpatowary@gmail.com an admin user.</p>
      
      <div className="flex gap-4">
        <Button 
          onClick={handleMakeAdmin}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up admin...
            </>
          ) : (
            'Make User Admin'
          )}
        </Button>
      </div>
      
      {result && (
        <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? 'Success' : 'Error'}
            </h3>
          </div>
          <p className="text-sm">{result.message || (result.success ? 'User has been granted admin access successfully.' : 'Failed to grant admin access.')}</p>
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
