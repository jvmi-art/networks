/** @format */

import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/theme-provider';
import { CanvasSettingsProvider } from './contexts/CanvasSettingsContext';
import { NODE_MODE_CONFIG } from './constants';
import CanvasVisualization from './components/CanvasVisualization';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <CanvasSettingsProvider initialSettings={NODE_MODE_CONFIG}>
          <CanvasVisualization />
        </CanvasSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
