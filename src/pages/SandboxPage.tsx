import { CanvasSettingsProvider } from '../contexts/CanvasSettingsContext';
import { FragmentProvider } from '../contexts/FragmentContext';
import { NODE_MODE_CONFIG } from '../constants';
import CanvasVisualization from '../components/CanvasVisualization';

function SandboxPage() {
  return (
    <CanvasSettingsProvider initialSettings={NODE_MODE_CONFIG}>
      <FragmentProvider>
        <CanvasVisualization />
      </FragmentProvider>
    </CanvasSettingsProvider>
  );
}

export default SandboxPage;