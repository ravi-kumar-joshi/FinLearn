/*
  client/src/main.jsx

  Purpose:
  - Application entry for the React client. Mounts the React tree onto the DOM.
  - Wraps the app with `BrowserRouter` for routing, an `ErrorBoundary` to
    catch rendering errors, and `Toaster` for global toast notifications.
*/

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
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
