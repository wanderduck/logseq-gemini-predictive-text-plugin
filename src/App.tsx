import { useEffect } from 'react';
import { Tooltip } from './components/Tooltip';
import { usePredictiveText } from './hooks/usePredictiveText';
import './App.css';

function App() {
  const { position, suggestions, isLoading, clearSuggestions, acceptSuggestion, selectedIndex } = usePredictiveText();

  // Show UI when Tooltip is active
  useEffect(() => {
    if (position) {
      logseq.showMainUI({ autoFocus: false }); // keep focus on editor
    } else {
      logseq.hideMainUI();
    }
  }, [position]);

  return (
    <>
      {position && (
        <Tooltip 
          position={position}
          suggestions={suggestions}
          isLoading={isLoading}
          onAccept={acceptSuggestion}
          onReject={clearSuggestions}
          selectedIndex={selectedIndex}
        />
      )}
    </>
  );
}

export default App;
