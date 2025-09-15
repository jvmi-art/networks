/** @format */

import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/theme-provider';
import HomePage from './pages/HomePage';
import SandboxPage from './pages/SandboxPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
