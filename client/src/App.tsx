import React, { useState, useEffect, useCallback } from 'react';
import { AICharacter, Timer, Message, ExtensionState } from './types';
import { socketService, SessionData, ExtensionResponse } from './services/socketService';
import { apiService } from './services/apiService';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ExtensionModal from './components/ExtensionModal';
import ConnectingScreen from './components/ConnectingScreen';

const App: React.FC = () => {
  // App state
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nextAI, setNextAI] = useState<AICharacter | null>(null);

  // AI character state
  const [aiCharacter, setAiCharacter] = useState<AICharacter | null>(null);

  // Timer state
  const [timer, setTimer] = useState<Timer>({
    minutes: 15,
    seconds: 0,
    isActive: false
  });

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);

  // Extension state
  const [extensionState, setExtensionState] = useState<ExtensionState>({
    isModalVisible: false,
    userDecision: null,
    aiDecision: null,
    hasBeenOffered: false
  });

  // Initialize connection and session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Connecting to server...');
        await socketService.connect();
        setIsConnected(true);

        console.log('Creating new session...');
        const { sessionId: newSessionId, aiCharacter: newAI } = await apiService.createSession();
        
        setSessionId(newSessionId);
        setAiCharacter(newAI);
        
        // Join the socket session
        socketService.joinSession(newSessionId);
        
        // Setup socket listeners
        setupSocketListeners();
        
        setTimer({
          minutes: 15,
          seconds: 0,
          isActive: true
        });
        
        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsConnecting(false);
      }
    };

    initializeApp();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.onSessionJoined((session: SessionData) => {
      console.log('Session joined:', session);
      setMessages(session.messages);
    });

    socketService.onNewMessage((message: Message) => {
      console.log('Received message:', message);
      console.log('Message text type:', typeof message.text);
      console.log('Message text value:', message.text);
      setMessages(prev => [...prev, message]);
    });

    socketService.onExtensionResponse((response: ExtensionResponse) => {
      setExtensionState(prev => ({
        ...prev,
        userDecision: response.userDecision,
        aiDecision: response.aiDecision
      }));
    });

    socketService.onSessionEnded(() => {
      handleSessionEnd();
    });

    socketService.onError((error) => {
      console.error('Socket error:', error);
    });
  };

  const handleSessionEnd = useCallback(async () => {
    try {
      console.log('Session ended, creating new session...');
      const { sessionId: newSessionId, aiCharacter: newAI } = await apiService.createSession();
      
      setNextAI(newAI);
      setIsConnecting(true);
      
      // Clean up current session
      if (sessionId) {
        socketService.endSession(sessionId);
      }
      
      // Connect to new session after delay
      setTimeout(() => {
        setSessionId(newSessionId);
        setAiCharacter(newAI);
        setMessages([]);
        setTimer({
          minutes: 15,
          seconds: 0,
          isActive: true
        });
        setExtensionState({
          isModalVisible: false,
          userDecision: null,
          aiDecision: null,
          hasBeenOffered: false
        });
        
        socketService.joinSession(newSessionId);
        setIsConnecting(false);
        setNextAI(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  }, [sessionId]);

  const handleExit = useCallback(() => {
    if (sessionId) {
      socketService.endSession(sessionId);
    }
    handleSessionEnd();
  }, [sessionId, handleSessionEnd]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timer.isActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = { ...prevTimer };
          
          if (newTimer.seconds > 0) {
            newTimer.seconds -= 1;
          } else if (newTimer.minutes > 0) {
            newTimer.minutes -= 1;
            newTimer.seconds = 59;
          } else {
            newTimer.isActive = false;
            // Auto end session when timer reaches 0
            if (sessionId) {
              socketService.endSession(sessionId);
            }
          }
          
          // Show extension modal at 2 minutes remaining
          if (newTimer.minutes === 2 && newTimer.seconds === 0 && !extensionState.hasBeenOffered) {
            setExtensionState(prev => ({
              ...prev,
              isModalVisible: true,
              hasBeenOffered: true
            }));
          }
          
          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isActive, extensionState.hasBeenOffered, sessionId]);

  // Handle extension outcomes
  useEffect(() => {
    if (extensionState.userDecision && extensionState.aiDecision) {
      setTimeout(() => {
        if (extensionState.userDecision === 'extend' && extensionState.aiDecision === 'extend') {
          // Both want to extend - reset timer
          setTimer({
            minutes: 15,
            seconds: 0,
            isActive: true
          });
          setExtensionState({
            isModalVisible: false,
            userDecision: null,
            aiDecision: null,
            hasBeenOffered: false
          });
        } else {
          // Either declined - end session
          if (sessionId) {
            socketService.endSession(sessionId);
          }
        }
      }, 2000);
    }
  }, [extensionState.userDecision, extensionState.aiDecision, sessionId]);

  const handleSendMessage = (text: string) => {
    console.log('Sending message:', text, typeof text);
    if (sessionId && isConnected) {
      socketService.sendMessage(sessionId, text);
    }
  };

  const handleExtend = () => {
    if (sessionId) {
      socketService.requestExtension(sessionId, 'extend');
    }
    setExtensionState(prev => ({
      ...prev,
      userDecision: 'extend'
    }));
  };

  const handleDecline = () => {
    if (sessionId) {
      socketService.requestExtension(sessionId, 'decline');
    }
    setExtensionState(prev => ({
      ...prev,
      userDecision: 'decline'
    }));
  };

  const handleNewAIConnected = useCallback((newAI: AICharacter) => {
    // This is handled by handleSessionEnd now
  }, []);

  if (isConnecting || !aiCharacter) {
    const displayAI = nextAI || aiCharacter || {
      id: 'loading',
      name: 'Loading',
      personality: 'Connecting to AI...',
      avatar: '⏳'
    };
    return <ConnectingScreen onConnected={handleNewAIConnected} newAI={displayAI} />;
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000000'
    }}>
      <ChatHeader aiCharacter={aiCharacter} timer={timer} onExit={handleExit} />
      <ChatMessages messages={messages} />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={!timer.isActive || !isConnected}
      />
      
      <ExtensionModal
        isVisible={extensionState.isModalVisible}
        onExtend={handleExtend}
        onDecline={handleDecline}
        aiWantsExtension={extensionState.aiDecision === 'extend'}
        userDecision={extensionState.userDecision}
      />
    </div>
  );
};

export default App;