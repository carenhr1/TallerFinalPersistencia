import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper">
        <Topbar activeTab={activeTab} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
