import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { OAuthLogin } from './components/OAuthLogin';
import { Tooltip } from './components/Tooltip';
import { geminiService } from './services/geminiService';
import { usePredictiveText } from './hooks/usePredictiveText';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [clientId, setClientId] = useState('');
  
  // Predictive Text Hook
  const { position, suggestions, isLoading, clearSuggestions, acceptSuggestion } = usePredictiveText();

  useEffect(() => {
    // Check if we need to show login
    const checkAuthStatus = () => {
      if (logseq.settings?.authMode === 'OAuth (Subscription)') {
        const id = logseq.settings?.oauthClientId as string;
        if (id) {
          setClientId(id);
          if (!geminiService.hasValidCredentials()) {
            setShowLogin(true);
            logseq.showMainUI();
          }
        }
      } else {
        setShowLogin(false);
      }
    };

    // Delay slightly to let settings load
    setTimeout(checkAuthStatus, 1000);
    
    // Check when settings change
    logseq.onSettingsChanged(checkAuthStatus);
    
    // Toolbar button to manually trigger login window
    logseq.App.registerUIItem('toolbar', {
      key: 'gemini-predict-login',
      template: `<a data-on-click="showGeminiLogin" class="button" title="Gemini Login">🤖</a>`
    });

    logseq.provideModel({
      showGeminiLogin: () => {
        if (logseq.settings?.authMode === 'OAuth (Subscription)') {
          if (!geminiService.hasValidCredentials()) {
            setShowLogin(true);
            logseq.showMainUI();
          } else {
            logseq.UI.showMsg("Already authenticated with OAuth.");
          }
        } else {
          logseq.UI.showMsg("Not using OAuth mode (using API key).");
        }
      }
    });
  }, []);

  // Show UI when either Tooltip is active OR Login modal is active
  useEffect(() => {
    if (showLogin || position) {
      logseq.showMainUI({ autoFocus: false }); // keep focus on editor
    } else {
      logseq.hideMainUI();
    }
  }, [showLogin, position]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  return (
    <>
      {showLogin && clientId && (
        <GoogleOAuthProvider clientId={clientId}>
          <main className="plugin-overlay" onClick={handleCloseLogin}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={handleCloseLogin}>×</button>
              <OAuthLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          </main>
        </GoogleOAuthProvider>
      )}

      {position && (
        <Tooltip 
          position={position}
          suggestions={suggestions}
          isLoading={isLoading}
          onAccept={acceptSuggestion}
          onReject={clearSuggestions}
        />
      )}
    </>
  );
}

export default App;
