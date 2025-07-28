import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CharacterCardV2 } from '../types/character';
import { characterApiService } from '../services/characterApiService';

interface CharacterState {
  // Data
  characters: CharacterCardV2[];
  selectedCharacter: CharacterCardV2 | null;
  availableTags: string[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isManagementOpen: boolean;
  isEditing: boolean;
  editingCharacter: CharacterCardV2 | null;
  
  // Filters
  searchQuery: string;
  selectedTags: string[];
  
  // Pagination
  currentPage: number;
  charactersPerPage: number;
}

type CharacterAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHARACTERS'; payload: CharacterCardV2[] }
  | { type: 'ADD_CHARACTER'; payload: CharacterCardV2 }
  | { type: 'UPDATE_CHARACTER'; payload: CharacterCardV2 }
  | { type: 'REMOVE_CHARACTER'; payload: string }
  | { type: 'SET_SELECTED_CHARACTER'; payload: CharacterCardV2 | null }
  | { type: 'SET_AVAILABLE_TAGS'; payload: string[] }
  | { type: 'TOGGLE_MANAGEMENT'; }
  | { type: 'SET_MANAGEMENT_OPEN'; payload: boolean }
  | { type: 'START_EDITING'; payload: CharacterCardV2 | null }
  | { type: 'STOP_EDITING' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_TAGS'; payload: string[] }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'CLEAR_FILTERS' };

const initialState: CharacterState = {
  characters: [],
  selectedCharacter: null,
  availableTags: [],
  isLoading: false,
  error: null,
  isManagementOpen: false,
  isEditing: false,
  editingCharacter: null,
  searchQuery: '',
  selectedTags: [],
  currentPage: 1,
  charactersPerPage: 12,
};

const characterReducer = (state: CharacterState, action: CharacterAction): CharacterState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.data.id === action.payload.data.id ? action.payload : char
        ),
        selectedCharacter: state.selectedCharacter?.data.id === action.payload.data.id 
          ? action.payload 
          : state.selectedCharacter
      };
    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(char => char.data.id !== action.payload),
        selectedCharacter: state.selectedCharacter?.data.id === action.payload 
          ? null 
          : state.selectedCharacter
      };
    case 'SET_SELECTED_CHARACTER':
      return { ...state, selectedCharacter: action.payload };
    case 'SET_AVAILABLE_TAGS':
      return { ...state, availableTags: action.payload };
    case 'TOGGLE_MANAGEMENT':
      return { ...state, isManagementOpen: !state.isManagementOpen };
    case 'SET_MANAGEMENT_OPEN':
      return { ...state, isManagementOpen: action.payload };
    case 'START_EDITING':
      return { 
        ...state, 
        isEditing: true, 
        editingCharacter: action.payload 
      };
    case 'STOP_EDITING':
      return { 
        ...state, 
        isEditing: false, 
        editingCharacter: null 
      };
    case 'SET_SEARCH_QUERY':
      return { 
        ...state, 
        searchQuery: action.payload,
        currentPage: 1 // Reset to first page when searching
      };
    case 'SET_SELECTED_TAGS':
      return { 
        ...state, 
        selectedTags: action.payload,
        currentPage: 1 // Reset to first page when filtering
      };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        searchQuery: '', 
        selectedTags: [], 
        currentPage: 1 
      };
    default:
      return state;
  }
};

interface CharacterContextType {
  state: CharacterState;
  dispatch: React.Dispatch<CharacterAction>;
  
  // Actions
  loadCharacters: () => Promise<void>;
  loadTags: () => Promise<void>;
  createCharacter: (data: Partial<CharacterCardV2['data']>) => Promise<CharacterCardV2>;
  updateCharacter: (id: string, updates: Partial<CharacterCardV2['data']>) => Promise<CharacterCardV2>;
  deleteCharacter: (id: string) => Promise<void>;
  searchCharacters: (query: string) => Promise<void>;
  exportCharacters: () => Promise<void>;
  importCharacters: (file: File, replace?: boolean) => Promise<void>;
  
  // Computed properties
  filteredCharacters: CharacterCardV2[];
  paginatedCharacters: CharacterCardV2[];
  totalPages: number;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadCharacters();
    loadTags();
  }, []);

  const handleError = (error: any) => {
    console.error('Character management error:', error);
    const message = error.message || 'An error occurred';
    dispatch({ type: 'SET_ERROR', payload: message });
    
    // Clear error after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }, 5000);
  };

  const loadCharacters = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const characters = await characterApiService.getAllCharacters();
      dispatch({ type: 'SET_CHARACTERS', payload: characters });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadTags = async () => {
    try {
      const tags = await characterApiService.getAllTags();
      dispatch({ type: 'SET_AVAILABLE_TAGS', payload: tags });
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const createCharacter = async (data: Partial<CharacterCardV2['data']>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCharacter = await characterApiService.createCharacter(data);
      dispatch({ type: 'ADD_CHARACTER', payload: newCharacter });
      await loadTags(); // Refresh tags
      return newCharacter;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCharacter = async (id: string, updates: Partial<CharacterCardV2['data']>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCharacter = await characterApiService.updateCharacter(id, updates);
      dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
      await loadTags(); // Refresh tags
      return updatedCharacter;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await characterApiService.deleteCharacter(id);
      dispatch({ type: 'REMOVE_CHARACTER', payload: id });
      await loadTags(); // Refresh tags
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const searchCharacters = async (query: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const results = await characterApiService.searchCharacters(query);
      dispatch({ type: 'SET_CHARACTERS', payload: results });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const exportCharacters = async () => {
    try {
      await characterApiService.downloadCharactersAsFile();
    } catch (error) {
      handleError(error);
    }
  };

  const importCharacters = async (file: File, replace: boolean = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await characterApiService.uploadCharactersFromFile(file, replace);
      await loadCharacters(); // Reload all characters
      await loadTags(); // Refresh tags
      
      // Show success message temporarily
      dispatch({ type: 'SET_ERROR', payload: `✓ ${result.message}` });
      setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
      }, 3000);
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Computed properties
  const getFilteredCharacters = (): CharacterCardV2[] => {
    return state.characters.filter(character => {
      const matchesSearch = !state.searchQuery || 
        character.data.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        character.data.description.toLowerCase().includes(state.searchQuery.toLowerCase());
      
      const matchesTags = state.selectedTags.length === 0 ||
        state.selectedTags.every(tag => character.data.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  };

  const getPaginatedCharacters = (): CharacterCardV2[] => {
    const filtered = getFilteredCharacters();
    const startIndex = (state.currentPage - 1) * state.charactersPerPage;
    const endIndex = startIndex + state.charactersPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = (): number => {
    const filtered = getFilteredCharacters();
    return Math.ceil(filtered.length / state.charactersPerPage);
  };

  return (
    <CharacterContext.Provider value={{
      state,
      dispatch,
      loadCharacters,
      loadTags,
      createCharacter,
      updateCharacter,
      deleteCharacter,
      searchCharacters,
      exportCharacters,
      importCharacters,
      filteredCharacters: getFilteredCharacters(),
      paginatedCharacters: getPaginatedCharacters(),
      totalPages: getTotalPages(),
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacterContext = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacterContext must be used within a CharacterProvider');
  }
  return context;
};