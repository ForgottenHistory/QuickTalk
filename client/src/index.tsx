import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './styles/base.css';
import './styles/layout.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/modals.css';
import './styles/chat.css';
import './styles/components.css';
import './styles/settings.css';
import './styles/characters.css';
import './styles/character-filters.css';
import './styles/character-editor.css';
import './styles/prompt-inspector.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);