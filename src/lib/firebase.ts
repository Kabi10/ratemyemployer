import { initializeApp } from '@firebase/app';

import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut 
} from '@firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Generic sign in function for OAuth providers
const signInWithProvider = async (provider: GoogleAuthProvider | GithubAuthProvider | TwitterAuthProvider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoUrl: user.photoURL
      }
    };
  } catch (error: any) {
    console.error('Sign-In Error:', error);
    // Handle specific error codes
    let errorMessage = 'Failed to sign in';
    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups and try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in was cancelled.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Email/Password sign in
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoUrl: user.photoURL
      }
    };
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    let errorMessage = 'Failed to sign in';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Email/Password sign up
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoUrl: user.photoURL
      }
    };
  } catch (error: any) {
    console.error('Email Sign-Up Error:', error);
    let errorMessage = 'Failed to create account';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account already exists with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Password reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Password Reset Error:', error);
    let errorMessage = 'Failed to send reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const signInWithGoogle = () => signInWithProvider(googleProvider);
export const signInWithGithub = () => signInWithProvider(githubProvider);
export const signInWithTwitter = () => signInWithProvider(twitterProvider);

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out'
    };
  }
};

export { auth };