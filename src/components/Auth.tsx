'use client';

// Barrel file for Auth components
// This file re-exports components from the Auth directory

// Named exports
export { LoginButton } from './Auth/LoginButton';
export { SignIn } from './Auth/SignIn';

// Default export for backward compatibility
import Auth from './Auth/Auth';
export default Auth; 