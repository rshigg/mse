import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import CardTest from 'pages/CardTest';
import Host from 'pages/Host';
import Visitor from 'pages/Visitor';
import WorkerProvider from 'worker/WorkerContext';
import { PeerConnectionProvider } from 'comms/PeerConnection';

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
    <PeerConnectionProvider>
      <WorkerProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<></>} />
            <Route path="/host" element={<Host></Host>} />
            <Route path="/visitor" element={<Visitor></Visitor>} />
            <Route path="/cardtest" element={<CardTest />} />
          </Route>
        </Routes>
      </WorkerProvider>
    </PeerConnectionProvider>
  );
}

export default App;
