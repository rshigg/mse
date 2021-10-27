import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import CardTest from 'pages/CardTest';
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
          <Route path="/" element={<></>} />
          <Route path="/cardtest" element={<CardTest />} />
        </Route>
      </Routes>
    </WorkerProvider>
  );
}

export default App;
