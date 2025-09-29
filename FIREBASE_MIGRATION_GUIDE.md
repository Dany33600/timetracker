# Firebase Migration Guide

## Overview
This guide covers the complete migration from Supabase to Firebase for your time tracking application.

## 1. Setup and Configuration

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Authentication, Firestore, and Storage

### Install Dependencies
```bash
npm remove @supabase/supabase-js
npm add firebase react-firebase-hooks
```

### Environment Configuration
Create a `.env` file with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 2. Authentication Migration

### Key Differences
- **Supabase**: Uses `supabase.auth.signInWithPassword()`
- **Firebase**: Uses `signInWithEmailAndPassword(auth, email, password)`

### Migration Steps
1. Replace Supabase auth imports with Firebase auth
2. Update authentication state management
3. Modify sign-in/sign-up methods

## 3. Database Migration

### Data Structure Changes
- **Supabase**: PostgreSQL with snake_case columns
- **Firebase**: NoSQL Firestore with camelCase fields

### Key Migrations
- `user_id` → `userId`
- `client_id` → `clientId` 
- `created_at` → `createdAt`
- `hourly_rate` → `hourlyRate`

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /timeEntries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 4. Real-time Data

### Key Advantage
Firebase provides real-time listeners out of the box:
```typescript
const unsubscribe = onSnapshot(q, (snapshot) => {
  // Real-time updates
})
```

## 5. Migration Checklist

- [x] Install Firebase dependencies
- [x] Configure Firebase project
- [x] Migrate authentication
- [x] Update database queries
- [x] Implement real-time listeners
- [x] Update data models
- [x] Test all functionality

## 6. Important Notes

### Performance Considerations
- Firestore charges per read/write operation
- Use real-time listeners judiciously
- Consider offline persistence for better UX

### Security
- Configure Firestore security rules
- Enable App Check for production
- Use Firebase Auth for user management

### Deployment
- Use Firebase Hosting for seamless integration
- Configure build settings for Vite
- Set up CI/CD with Firebase CLI

## 7. Testing

After migration, test:
- User authentication (sign up, sign in, sign out)
- Client CRUD operations
- Time entry management
- Real-time updates
- Data persistence

## 8. Rollback Plan

Keep Supabase project active during migration:
1. Test Firebase implementation thoroughly
2. Migrate data in batches
3. Monitor for issues
4. Have rollback procedures ready

## Support

For issues during migration:
- Check Firebase documentation
- Review console errors
- Test with Firebase emulators
- Monitor Firebase console for errors