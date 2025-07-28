import React, { useRef } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { characterImageParser } from '../services/characterImageParser';
import { Button } from './shared';

const CharacterActions: React.FC = () => {
  const { exportCharacters, importCharacters, createCharacter } = useCharacterContext();
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const pngFileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportCharacters();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportJsonClick = () => {
    jsonFileInputRef.current?.click();
  };

  const handleImportPngClick = () => {
    pngFileInputRef.current?.click();
  };

  const handleJsonFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = '';
    }
  };

  const handlePngFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const importedCharacters = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file: ${file.name}`);
        
        try {
          // Try primary extraction method
          let characterData = await characterImageParser.extractFromPNG(file);
          
          // If that fails, try alternative method
          if (!characterData) {
            console.log('Primary method failed, trying alternative extraction...');
            characterData = await characterImageParser.extractFromPNGAlternative(file);
          }
          
          if (characterData) {
            // Generate unique ID to avoid conflicts
            characterData.data.id = `imported_${Date.now()}_${i}`;
            importedCharacters.push(characterData);
            console.log(`Successfully extracted character: ${characterData.data.name}`);
          } else {
            console.warn(`No character data found in ${file.name}`);
          }
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
        }
      }

      if (importedCharacters.length === 0) {
        alert('No valid character data found in the selected PNG files.\n\nMake sure the PNG files contain embedded Character Card V2 data.');
        return;
      }

      // Create each character individually
      for (const character of importedCharacters) {
        await createCharacter(character.data);
      }

      alert(`Successfully imported ${importedCharacters.length} character(s) from PNG files.`);

    } catch (error) {
      console.error('PNG import failed:', error);
      alert('Failed to import characters from PNG files.');
    }

    // Reset file input
    if (pngFileInputRef.current) {
      pngFileInputRef.current.value = '';
    }
  };

  return (
    <div className="character-actions">
      <div className="character-actions-section">
        <h4 className="character-actions-title">📁 Import / Export</h4>
        <div className="character-actions-buttons">
          <Button onClick={handleExport} variant="secondary">
            💾 Export JSON
          </Button>
          <Button onClick={handleImportJsonClick} variant="secondary">
            📂 Import JSON
          </Button>
        </div>
        <p className="character-actions-description">
          Export your characters as a JSON file for backup or sharing. 
          Import characters from a JSON file to restore or add new ones.
        </p>
      </div>

      <div className="character-actions-section">
        <h4 className="character-actions-title">🖼️ Character Card Images</h4>
        <div className="character-actions-buttons">
          <Button onClick={handleImportPngClick} variant="secondary">
            🖼️ Import PNG Cards
          </Button>
        </div>
        <p className="character-actions-description">
          Import Character Card V2 PNG images that contain embedded character data. 
          You can select multiple PNG files at once.
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={jsonFileInputRef}
        type="file"
        accept=".json"
        onChange={handleJsonFileChange}
        style={{ display: 'none' }}
      />
      
      <input
        ref={pngFileInputRef}
        type="file"
        accept=".png"
        multiple
        onChange={handlePngFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CharacterActions;