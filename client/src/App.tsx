import React from 'react';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import AppContainer from './containers/AppContainer';

const App: React.FC = () => {
  return (
    <AppProvider>
      <SettingsProvider>
        <AppContainer />
      </SettingsProvider>
    </AppProvider>
  );
};

export default App;