# Gemini AI Chat Feature

This feature allows you to chat with Google's Gemini AI model about your habits and progress. The AI will automatically have context about your current habits, streaks, and completion status.

## Setup

1. Obtain a Gemini API key:
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create an account or sign in
   - Navigate to "Get API key" section
   - Create a new API key
   - Copy the key

2. Configure your app:
   - Create a `.env` file in the root directory of your project
   - Add the following line, replacing `your_api_key_here` with your actual API key:
     ```
     EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
     ```
   - Restart your development server if it's already running

## Usage

1. The chat button appears as a floating blue bubble with a chat icon in the bottom right corner of your screen.

2. Tap the chat button to open the chat interface.

3. Type your message and send it to Gemini AI.

4. Examples of questions you can ask:
   - "How am I doing with my habits overall?"
   - "Which habits do I need to complete today?"
   - "What's my longest streak?"
   - "Do you have any tips for maintaining my exercise habit?"
   - "Can you suggest a plan for improving my consistency?"

5. The AI will respond with personalized feedback based on your actual habit data.

6. You can clear the conversation by tapping the trash icon in the input area.

## Privacy Note

Your habit data is only shared with the Gemini AI service when you initiate a chat. No data is stored on Google's servers beyond the temporary processing required to generate a response. 