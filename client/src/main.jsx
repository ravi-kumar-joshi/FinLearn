
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import ErrorBoundary from './Components/ErrorBoundary.jsx';
import './index.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {/* Global toast container; configure position/app behavior here */}
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
