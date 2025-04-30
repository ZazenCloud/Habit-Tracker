import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGemini } from '../context/GeminiContext';
import Markdown from 'react-native-markdown-display';

interface GeminiChatProps {
  isVisible: boolean;
  onClose: () => void;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ isVisible, onClose }) => {
  const { chatHistory, sendMessage, isLoading, clearChat, streamingContent } = useGemini();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Scroll to bottom when chat history updates or during streaming, but only if auto-scroll is enabled
  useEffect(() => {
    if (scrollViewRef.current && autoScroll) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory, streamingContent, autoScroll]);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;
    
    const messageText = inputText;
    setInputText('');
    await sendMessage(messageText);
  };

  // Function to manually scroll to bottom
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderChatBubble = (role: string, content: string, index: number) => {
    const isUser = role === 'user';
    return (
      <View 
        key={index} 
        style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.aiBubble
        ]}
      >
        {isUser ? (
          <Text style={[styles.messageText, styles.userText]}>
            {content}
          </Text>
        ) : (
          <Markdown style={markdownStyles} mergeStyle={true}>
            {content}
          </Markdown>
        )}
      </View>
    );
  };

  // Create the content of the modal
  const renderModalContent = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coach</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.autoScrollButton} 
            onPress={() => setAutoScroll(!autoScroll)}
          >
            <Ionicons 
              name={autoScroll ? "arrow-down-circle" : "arrow-down-circle-outline"} 
              size={22} 
              color="#007AFF" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {chatHistory.length === 0 && !streamingContent ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              Start a conversation with Gemini AI about your habits!
            </Text>
          </View>
        ) : (
          <>
            {chatHistory.map((message, index) => 
              renderChatBubble(message.role, message.content, index)
            )}
            
            {/* Show streaming content as it comes in */}
            {streamingContent !== null && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Markdown style={markdownStyles} mergeStyle={true}>
                  {streamingContent}
                </Markdown>
              </View>
            )}
          </>
        )}
        
        {isLoading && !streamingContent && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0066FF" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearChat}
          disabled={chatHistory.length === 0}
        >
          <Ionicons 
            name="trash-outline" 
            size={20} 
            color={chatHistory.length === 0 ? "#A0A0A0" : "#FF3B30"} 
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          autoCapitalize="none"
          autoCorrect={true}
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim() === '' ? styles.sendButtonDisabled : {}]} 
          onPress={handleSend}
          disabled={inputText.trim() === '' || isLoading}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {Platform.OS === 'web' ? (
        <View style={styles.webModalContainer}>
          <View style={styles.webModalContent}>
            {renderModalContent()}
          </View>
        </View>
      ) : (
        renderModalContent()
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Web-specific modal styling
  webModalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  webModalContent: {
    width: '50%',
    maxHeight: '90%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: Platform.OS === 'ios' ? 40 : 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButtons: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginLeft: 12,
  },
  autoScrollButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyChat: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChatText: {
    color: '#8E8E93',
    textAlign: 'center',
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 6,
  },
  userBubble: {
    backgroundColor: '#0066FF',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: 'black',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: 'black', // AI text color
  },
  strong: {
    fontWeight: 'bold',
  },
  // Add more styles as needed for other markdown elements (e.g., lists, links)
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet_list_icon: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16, // Match body font size
    lineHeight: 22, // Match body line height
    color: 'black',
  },
});

export default GeminiChat; 