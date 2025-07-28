import { CharacterCardV2 } from '../types/character';

class CharacterImageParser {
  
  async extractFromPNG(file: File): Promise<CharacterCardV2 | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const dataView = new DataView(arrayBuffer);
      
      // Check PNG signature
      if (!this.isPNG(dataView)) {
        throw new Error('File is not a valid PNG');
      }
      
      // Parse PNG chunks to find text data
      const textData = this.extractTextChunks(dataView);
      
      // Look for character data in text chunks
      for (const text of textData) {
        const characterData = this.parseCharacterData(text);
        if (characterData) {
          // Convert and optimize image for avatar
          const optimizedImageUrl = await this.optimizeImageForAvatar(file);
          
          // Set the optimized image as avatar
          characterData.data.avatar = optimizedImageUrl;
          
          return characterData;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to extract character data from PNG:', error);
      throw error;
    }
  }
  
  private isPNG(dataView: DataView): boolean {
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    for (let i = 0; i < signature.length; i++) {
      if (dataView.getUint8(i) !== signature[i]) {
        return false;
      }
    }
    return true;
  }
  
  private extractTextChunks(dataView: DataView): string[] {
    const textChunks: string[] = [];
    let offset = 8; // Skip PNG signature
    
    try {
      while (offset < dataView.byteLength - 8) {
        // Read chunk length (4 bytes, big-endian)
        const length = dataView.getUint32(offset);
        offset += 4;
        
        // Read chunk type (4 bytes)
        const type = this.readString(dataView, offset, 4);
        offset += 4;
        
        // If this is a text chunk, extract the data
        if (['tEXt', 'zTXt', 'iTXt'].includes(type)) {
          const chunkData = this.extractChunkText(dataView, offset, length, type);
          if (chunkData) {
            textChunks.push(chunkData);
          }
        }
        
        // Skip chunk data and CRC
        offset += length + 4;
        
        // Stop at IEND
        if (type === 'IEND') {
          break;
        }
      }
    } catch (error) {
      console.warn('Error parsing PNG chunks:', error);
    }
    
    return textChunks;
  }
  
  private extractChunkText(dataView: DataView, offset: number, length: number, type: string): string | null {
    try {
      if (type === 'tEXt') {
        // tEXt: keyword\0text
        const data = new Uint8Array(dataView.buffer, offset, length);
        const nullIndex = data.indexOf(0);
        
        if (nullIndex !== -1) {
          // Extract keyword
          const keyword = this.uint8ArrayToString(data.slice(0, nullIndex));
          
          // Extract text after null separator
          const text = this.uint8ArrayToString(data.slice(nullIndex + 1));
          
          console.log(`Found tEXt chunk - keyword: "${keyword}", text length: ${text.length}`);
          
          // Common keywords for character data
          if (['chara', 'character', 'char', 'ccv2', 'json'].includes(keyword.toLowerCase())) {
            return text;
          }
          
          // Sometimes the entire chunk is just JSON without a keyword
          if (text.trim().startsWith('{')) {
            return text;
          }
        } else {
          // No null separator, treat entire chunk as text
          const text = this.uint8ArrayToString(new Uint8Array(dataView.buffer, offset, length));
          if (text.trim().startsWith('{')) {
            return text;
          }
        }
      }
      
      // For other text chunk types, just extract as string
      const text = this.uint8ArrayToString(new Uint8Array(dataView.buffer, offset, length));
      if (text.includes('"spec"') && text.includes('chara_card_v2')) {
        return text;
      }
      
    } catch (error) {
      console.warn('Error extracting chunk text:', error);
    }
    
    return null;
  }
  
  private uint8ArrayToString(data: Uint8Array): string {
    // Handle binary data that might not be valid UTF-8
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      if (byte === 0) break; // Stop at null terminator
      if (byte >= 32 && byte <= 126) {
        // Printable ASCII
        result += String.fromCharCode(byte);
      } else if (byte >= 128) {
        // Try to handle UTF-8
        try {
          result += String.fromCharCode(byte);
        } catch (e) {
          // Skip invalid bytes
        }
      }
    }
    return result;
  }
  
  private readString(dataView: DataView, offset: number, length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return result;
  }
  
  private parseCharacterData(text: string): CharacterCardV2 | null {
    try {
      // Clean up the text
      let cleanText = text.trim();
      
      // Look for JSON start
      const jsonStart = cleanText.indexOf('{');
      if (jsonStart !== -1) {
        cleanText = cleanText.substring(jsonStart);
      }
      
      // Look for JSON end
      const lastBrace = cleanText.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleanText = cleanText.substring(0, lastBrace + 1);
      }
      
      console.log('Attempting to parse JSON:', cleanText.substring(0, 200) + '...');
      
      const parsed = JSON.parse(cleanText);
      
      if (this.isValidCharacterCard(parsed)) {
        console.log('Valid character card found:', parsed.data.name);
        return parsed;
      } else {
        console.log('Invalid character card structure');
      }
    } catch (error) {
      console.warn('Failed to parse JSON from text:', error);
      
      // Try to extract JSON using regex as fallback
      const jsonMatch = text.match(/\{[\s\S]*"spec"\s*:\s*"chara_card_v2"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (this.isValidCharacterCard(parsed)) {
            return parsed;
          }
        } catch (e) {
          console.warn('Regex extraction also failed:', e);
        }
      }
    }
    
    return null;
  }
  
  private isValidCharacterCard(data: any): data is CharacterCardV2 {
    const isValid = data && 
           typeof data === 'object' && 
           data.spec === 'chara_card_v2' && 
           data.data && 
           typeof data.data.name === 'string';
    
    console.log('Character card validation:', {
      hasData: !!data,
      hasSpec: data?.spec === 'chara_card_v2',
      hasDataObject: !!data?.data,
      hasName: typeof data?.data?.name === 'string',
      isValid
    });
    
    return isValid;
  }
  
  private async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Optimize image for avatar use (resize and compress)
  private async optimizeImageForAvatar(file: File, maxSize: number = 256): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Calculate new dimensions (square, max 256px)
          const size = Math.min(maxSize, Math.max(img.width, img.height));
          canvas.width = size;
          canvas.height = size;
          
          // Draw image centered and scaled
          const scale = size / Math.max(img.width, img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (size - scaledWidth) / 2;
          const y = (size - scaledHeight) / 2;
          
          ctx.fillStyle = '#000000'; // Black background
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          // Convert to optimized data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality JPEG
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Alternative method: try to extract from base64 encoded data in the PNG
  async extractFromPNGAlternative(file: File): Promise<CharacterCardV2 | null> {
    try {
      const text = await file.text();
      
      // Look for base64 encoded JSON
      const base64Patterns = [
        /eyJ[\w\+\/=]+/g, // Common start of base64 JSON
        /data:application\/json;base64,([A-Za-z0-9+/=]+)/g
      ];
      
      for (const pattern of base64Patterns) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            try {
              const base64Data = match.replace('data:application/json;base64,', '');
              const decoded = atob(base64Data);
              const parsed = JSON.parse(decoded);
              
              if (this.isValidCharacterCard(parsed)) {
                const imageDataUrl = await this.fileToDataURL(file);
                parsed.data.avatar = imageDataUrl;
                return parsed;
              }
            } catch (e) {
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Alternative extraction failed:', error);
    }
    
    return null;
  }
}

export const characterImageParser = new CharacterImageParser();