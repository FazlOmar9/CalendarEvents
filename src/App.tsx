import { GoogleOAuthProvider } from '@react-oauth/google';
import { CalendarApp } from './components/CalendarApp';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CalendarApp />
    </GoogleOAuthProvider>
  );
}

export default App;