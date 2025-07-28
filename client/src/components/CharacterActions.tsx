import React, { useRef } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Button } from './shared';

const CharacterActions: React.FC = () => {
  const { exportCharacters, importCharacters } = useCharacterContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportCharacters();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const replace = window.confirm(
      'Do you want to replace all existing characters with the imported ones?\n\n' +
      'Click "OK" to replace all characters.\n' +
      'Click "Cancel" to add imported characters to existing ones.'
    );

    try {
      await importCharacters(file, replace);
    } catch (error) {
      console.error('Import failed:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="character-actions">
      <div className="character-actions-section">
        <h4 className="character-actions-title">📁 Import / Export</h4>
        <div className="character-actions-buttons">
          <Button onClick={handleExport} variant="secondary">
            💾 Export Characters
          </Button>
          <Button onClick={handleImportClick} variant="secondary">
            📂 Import Characters
          </Button>
        </div>
        <p className="character-actions-description">
          Export your characters as a JSON file for backup or sharing. 
          Import characters from a JSON file to restore or add new ones.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CharacterActions;