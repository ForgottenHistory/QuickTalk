import React from 'react';
import { AppProvider } from './context/AppContext';
import AppContainer from './containers/AppContainer';

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
};

export default App;