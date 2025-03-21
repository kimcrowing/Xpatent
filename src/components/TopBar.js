import React from 'react';
import '../styles/TopBar.css';

function TopBar({ darkMode, setDarkMode, setSidebarOpen, sidebarOpen, createNewConversation }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M7.46967 7.46967C7.76256 7.17678 8.23744 7.17678 8.53033 7.46967L12 10.9393L15.4697 7.46967C15.7626 7.17678 16.2374 7.17678 16.5303 7.46967C16.8232 7.76256 16.8232 8.23744 16.5303 8.53033L13.0607 12L16.5303 15.4697C16.8232 15.7626 16.8232 16.2374 16.5303 16.5303C16.2374 16.8232 15.7626 16.8232 15.4697 16.5303L12 13.0607L8.53033 16.5303C8.23744 16.8232 7.76256 16.8232 7.46967 16.5303C7.17678 16.2374 7.17678 15.7626 7.46967 15.4697L10.9393 12L7.46967 8.53033C7.17678 8.23744 7.17678 7.76256 7.46967 7.46967Z" fill="currentColor"/>
          </svg>
          <span>Grok</span>
        </div>
        
        <button 
          className="menu-button" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="菜单"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="topbar-actions">
        <button 
          className="topbar-icon-button" 
          onClick={createNewConversation}
          aria-label="分享"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="topbar-icon-button" 
          onClick={createNewConversation}
          aria-label="下载"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="topbar-icon-button" 
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "切换至亮色模式" : "切换至暗色模式"}
        >
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C10.8065 4.19347 10.136 5.81217 10.136 7.5C10.136 9.18783 10.8065 10.8065 12 12C13.1935 13.1935 14.8122 13.864 16.5 13.864C18.1878 13.864 19.8065 13.1935 21 12C21 13.78 20.4722 15.5201 19.4832 17.0001C18.4943 18.4802 17.0887 19.6337 15.4442 20.3149C13.7996 20.9961 11.9894 21.1743 10.2442 20.8271C8.49899 20.4798 6.89523 19.6226 5.63604 18.364C4.37685 17.1055 3.5192 15.5012 3.17195 13.756C2.8247 12.0108 3.00255 10.2006 3.68348 8.55585C4.36441 6.91109 5.51799 5.50524 6.99806 4.51633C8.47813 3.52742 10.2183 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        
        <div className="user-avatar-button">
          KQ
        </div>
      </div>
    </div>
  );
}

export default TopBar; 