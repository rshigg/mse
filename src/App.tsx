import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import WorkerProvider from 'worker/WorkerContext';
import CardTest from 'pages/CardTest';
import ProjectPage from 'pages/Project';

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
          <Route path="/:projectCode" element={<ProjectPage />}>
            <Route path=":cardId" element={<></>} />
          </Route>
        </Route>
      </Routes>
    </WorkerProvider>
  );
}

export default App;
