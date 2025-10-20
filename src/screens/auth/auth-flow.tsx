import { useState } from 'react';

import { LoginScreen } from './login';
import { SignupScreen } from './signup';
import { WelcomeScreen } from './welcome';

export type AuthRoute = 'welcome' | 'login' | 'signup';

/**
 * The unauthenticated branch of the shell.
 *
 * A signed-up or signed-in session flips the auth store to `authenticated`, and the root
 * layout swaps this flow out for the tab shell.
 */
export function AuthFlow() {
  const [route, setRoute] = useState<AuthRoute>('welcome');

  if (route === 'login') return <LoginScreen onNavigate={setRoute} />;
  if (route === 'signup') return <SignupScreen onNavigate={setRoute} />;
  return <WelcomeScreen onNavigate={setRoute} />;
}
