import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PasswordResetRequest } from '@/react-app/components/auth/PasswordResetRequest';
import { PasswordUpdate } from '@/react-app/components/auth/PasswordUpdate';
import { AuthLayout } from '@/react-app/components/auth/AuthLayout';

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  // Check if this is a password reset link with an access token
  const accessToken = searchParams.get('access_token');
  const type = searchParams.get('type');

  // If we have an access token and it's a recovery type, show the password update form
  if (accessToken && type === 'recovery') {
    return (
      <AuthLayout title="Reset Your Password">
        <PasswordUpdate />
      </AuthLayout>
    );
  }

  // Otherwise, show the password reset request form
  return (
    <AuthLayout title="Forgot Password">
      <PasswordResetRequest 
        email={email} 
        onEmailChange={setEmail} 
        onBack={() => navigate('/auth')} 
      />
    </AuthLayout>
  );
}
