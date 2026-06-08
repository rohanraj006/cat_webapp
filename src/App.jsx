import React, { useState } from 'react';
import { CATDataProvider, useCATData } from './context/CATDataContext';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ChecklistView from './views/ChecklistView';
import CalendarView from './views/CalendarView';
import ProfileView from './views/ProfileView';

function AppContent() {
  const { isLoggedIn } = useCATData();
  const [activeTab, setActiveTab] = useState('dashboard');

  // If user is not authenticated, force display of Login page
  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Switch between tabs within the same page/window context
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'checklist':
        return <ChecklistView />;
      case 'calendar':
        return <CalendarView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="app-container">
        {renderActiveView()}
      </main>
    </>
  );
}

function App() {
  return (
    <CATDataProvider>
      <AppContent />
    </CATDataProvider>
  );
}

export default App;
