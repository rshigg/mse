import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import WorkerProvider from './WorkerContext';

function App() {
  return (
    <Router>
      <WorkerProvider>
        <div className="app">
          <nav></nav>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
        </div>
      </WorkerProvider>
    </Router>
  );
}

export default App;
