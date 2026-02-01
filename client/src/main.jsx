/**
 * Main Entry Point
 * 
 * This is where React mounts to the DOM. We wrap the entire application
 * in React.StrictMode which helps catch common bugs during development.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Mount the React application to the root element
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
