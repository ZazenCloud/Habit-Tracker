# Habit Tracker

A simple mobile app to track daily habits and view progress.

## Scope

- Be able to add a daily habit I want to track
- Be able to track the habit for a day
- Be able to view the history of the habit
- See the streak for that habit
- Be able to edit/delete habits

## Tech Stack

- React Native
- Expo
- TypeScript
- Firebase

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Add a Web App to your project
   - Copy the Firebase configuration
   - Update the `config/firebase.ts` file with your Firebase configuration

4. Start the development server:
   ```
   npm start
   ```

5. Run on a device or emulator:
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For web: `npm run web`

## Usage

- **Habits Tab**: Add new habits and mark them complete for today
- **History Tab**: View your habit completion history for the last 7 days

## Features

- Add new habits
- Track daily habit completion
- Visualize streaks for each habit
- View 7-day history for all habits
- Delete habits

## Future Enhancements

- User authentication
- More detailed habit analytics
- Custom habit schedules (e.g., weekly, monthly)
- Reminders and notifications
- Themes and customization

## Advanced Features

- Notifications
- Add habits to different categories
- Support different habit frequencies (daily, weekly, specific days)
