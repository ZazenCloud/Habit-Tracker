import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useHabits } from './HabitsContext';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';

interface GeminiContextProps {
  isLoading: boolean;
  chatHistory: Array<{ role: string; content: string }>;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  streamingContent: string | null;
}

const GeminiContext = createContext<GeminiContextProps | undefined>(undefined);

interface GeminiProviderProps {
  children: ReactNode;
}

export const GeminiProvider = ({ children }: GeminiProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const { habits } = useHabits();
  const { user } = useAuth();
  
  // Function to generate habits context as a string
  const generateHabitsContext = () => {
    if (!habits || habits.length === 0) {
      return "You don't have any habits tracked yet.";
    }

    const today = new Date().toISOString().split('T')[0];
    const habitsSummary = habits.map(habit => {
      const completed = habit.completedDates.includes(today);
      return `- ${habit.name}: Current streak: ${habit.streak} days. ${completed ? 'Completed today.' : 'Not completed today.'}`;
    }).join('\n');

    return `Current habits:\n${habitsSummary}`;
  };

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setStreamingContent("");
      
      // Get API key - in a real app, store this securely
      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Gemini API key is not configured');
      }
      
      // Initialize the API
      const genAI = new GoogleGenAI({ apiKey: API_KEY });
      
      // Add user message to chat history
      const userMessage = { role: 'user', content: message };
      setChatHistory(prev => [...prev, userMessage]);
      
      // Prepare context about habits
      const habitsContext = generateHabitsContext();
      
      // Get user's name
      const userName = user?.displayName || 'there';
      
      // Create chat history for API (including system message with habits context)
      const systemMessage = `You are a helpful assistant for a habit tracking app. You're speaking with ${userName}. Here is information about the user's current habits: ${habitsContext}`;
      
      // Format message content for the API
      const historyContents = chatHistory.map(msg => ({ 
        role: msg.role, 
        parts: [{ text: msg.content }] 
      }));
      const userContent = { role: 'user', parts: [{ text: message }] };
      
      // Different handling for web vs native
      if (Platform.OS === 'web') {
        // Use streaming on web where it's well-supported
        const model = genAI.models.generateContentStream;
        const streamingResponse = await model({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction: systemMessage,
          },
          contents: [...historyContents, userContent]
        });
        
        // Process the stream
        let fullResponse = '';
        for await (const chunk of streamingResponse) {
          if (chunk.text) {
            fullResponse += chunk.text;
            setStreamingContent(fullResponse);
          }
        }
        
        // When streaming is complete, add the full response to chat history
        const aiMessage = { role: 'model', content: fullResponse };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        // Use non-streaming approach for native platforms
        const model = genAI.models.generateContent;
        const response = await model({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction: systemMessage,
          },
          contents: [...historyContents, userContent]
        });
        
        if (response && response.text) {
          // Simulate streaming for consistency in UX
          const text = response.text;
          let displayedText = '';
          
          // Show text incrementally to simulate streaming
          const totalChars = text.length;
          const chunkSize = Math.max(1, Math.floor(totalChars / 20)); // Divide into ~20 chunks
          
          for (let i = 0; i < totalChars; i += chunkSize) {
            const end = Math.min(i + chunkSize, totalChars);
            displayedText = text.substring(0, end);
            setStreamingContent(displayedText);
            
            // Small delay between chunks (not too long)
            await new Promise(resolve => setTimeout(resolve, 30));
          }
          
          // When complete, add to chat history
          const aiMessage = { role: 'model', content: text };
          setChatHistory(prev => [...prev, aiMessage]);
        }
      }
      
      // Clear streaming content when done
      setStreamingContent(null);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
      setStreamingContent(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    setChatHistory([]);
    setStreamingContent(null);
  };

  return (
    <GeminiContext.Provider
      value={{
        isLoading,
        chatHistory,
        sendMessage,
        clearChat,
        streamingContent
      }}
    >
      {children}
    </GeminiContext.Provider>
  );
};

export const useGemini = (): GeminiContextProps => {
  const context = useContext(GeminiContext);
  if (context === undefined) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return context;
}; 