import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { geminiService } from '../services/geminiService';

export const OAuthLogin: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      geminiService.setOAuthToken(tokenResponse.access_token);
      logseq.UI.showMsg('Successfully authenticated with Google!', 'success');
      onLoginSuccess();
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      logseq.UI.showMsg('Google OAuth login failed.', 'error');
    },
    scope: 'https://www.googleapis.com/auth/generative-language.retriever', // Basic scope for Gemini
  });

  return (
    <div style={{ padding: '20px', background: 'var(--ls-primary-background-color)', color: 'var(--ls-primary-text-color)', borderRadius: '8px', border: '1px solid var(--ls-border-color)' }}>
      <h2>Logseq Gemini Authentication</h2>
      <p>Please log in with your Google account to enable predictive text via your Gemini subscription.</p>
      <button 
        onClick={() => login()}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          background: 'var(--ls-link-text-color)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};
