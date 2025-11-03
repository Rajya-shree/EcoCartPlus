import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx'; // 1. Import Header

function App() {
  return (
    <div className="App">
      <Header /> {/* 2. Add Header at the top */}
      <main className="main-content">
        <Outlet /> {/* 3. Outlet renders the current page */}
      </main>
    </div>
  );
}

export default App;