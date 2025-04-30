import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GeminiChat from './GeminiChat';

const ChatButton: React.FC = () => {
  const [chatVisible, setChatVisible] = useState(false);

  const openChat = () => {
    setChatVisible(true);
  };

  const closeChat = () => {
    setChatVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={openChat}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>
      
      <GeminiChat 
        isVisible={chatVisible}
        onClose={closeChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ChatButton; 