import React from 'react';
import ReactDOM from 'react-dom/client';
import { 应用 } from './应用';
import './样式.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <应用 />
  </React.StrictMode>
);

