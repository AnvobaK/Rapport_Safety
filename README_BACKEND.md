# Backend Setup for Rapport_Safety

## 1. Firebase Project Setup
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable Authentication (Email/Password)
- Enable Firestore Database (in test mode, then apply security rules)
- Enable Firebase Storage (optional, for images)
- Enable Cloud Messaging (for push notifications)

## 2. Cloud Functions Setup
- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`
- Initialize functions: `firebase init functions`
- Choose JavaScript or TypeScript
- Add the provided Cloud Functions code to `functions/index.js`
- Install SendGrid: `npm install @sendgrid/mail` in the `functions` directory
- Set SendGrid API key: `firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"`
- Deploy functions: `firebase deploy --only functions`

## 3. Firestore Security Rules
- Copy the contents of `firestore.rules` to the Firestore rules section in the Firebase Console or deploy with:
  `firebase deploy --only firestore:rules`

## 4. Cloudinary (Optional)
- [Sign up for Cloudinary](https://cloudinary.com/users/register/free)
- Get your Cloudinary cloud name, API key, and secret
- Use these in your frontend for direct uploads, or use Firebase Storage for unlimited free uploads

## 5. Email Service (SendGrid)
- [Sign up for SendGrid](https://sendgrid.com/free/)
- Get your API key and set it in Firebase Functions config as above

## 6. Environment Variables
- Never commit API keys to source control
- Use Firebase Functions config for sensitive keys

## 7. Backend Structure
- `firestore.rules` — Firestore security rules
- `functions/` — Cloud Functions (SOS alert email, push notifications, etc.)
- Cloudinary/Firebase Storage — for image uploads

## 8. Deploy
- Deploy rules: `firebase deploy --only firestore:rules`
- Deploy functions: `firebase deploy --only functions`

---

For more details, see the comments in each file or ask for specific code examples. 