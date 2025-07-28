import React from 'react';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import AppContainer from './containers/AppContainer';
import { CharacterProvider } from './context/CharacterContext';

// Update the App component:
const App: React.FC = () => {
  return (
    <AppProvider>
      <SettingsProvider>
        <CharacterProvider>
          <AppContainer />
        </CharacterProvider>
      </SettingsProvider>
    </AppProvider>
  );
};

export default App;