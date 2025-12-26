import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SignalRProvider } from './context/SignalRContext';
import AppRouter from './router/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignalRProvider> {/* SignalR a besoin de Auth pour le token */}
          <AppRouter />
          <Toaster position="top-center" />
        </SignalRProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;