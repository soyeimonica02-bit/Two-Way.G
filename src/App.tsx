import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { initTheme } from './utils/themePalettes';
import { ThemeProvider } from './context/ThemeContext';
import { MoodProvider } from './context/MoodContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <ThemeProvider>
      <MoodProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </MoodProvider>
    </ThemeProvider>
  );
}

export default App;