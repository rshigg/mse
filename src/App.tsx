import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import Home from 'pages/Home';
import Set from 'pages/Set';
import WorkerProvider from 'worker/WorkerContext';

const Layout = () => {
  return (
    <div className="app">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <WorkerProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="set">
            <Route path=":setId" element={<Set />} />
          </Route>
        </Route>
      </Routes>
    </WorkerProvider>
  );
}

export default App;
