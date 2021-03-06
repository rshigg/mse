import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import LocalDBProvider from 'db/LocalDBContext';
import KBarProvider from 'components/KBar';
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
    <LocalDBProvider>
      <KBarProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<></>} />
            <Route path="/cardtest" element={<CardTest />} />
            <Route path="/:projectCode" element={<ProjectPage />}>
              <Route path=":cardId" element={<></>} />
            </Route>
          </Route>
        </Routes>
      </KBarProvider>
    </LocalDBProvider>
  );
}

export default App;
