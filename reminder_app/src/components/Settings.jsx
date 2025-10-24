import React, { useState, useEffect } from 'react';
import Navbar from '../Navabar/Navbar';
import { FiSave, FiMoon, FiSun, FiBell, FiGlobe } from 'react-icons/fi';

const Settings = () => {
  // Get userId from your auth context or wherever you store it
  const userId = 1; // Replace with actual user ID from your auth system
  
  const [settings, setSettings] = useState({
      language: 'english',
      theme: 'light',
      notification: true
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      // Apply theme to body
      document.body.className = settings.theme;
      
      // Load settings when component mounts
      const loadSettings = async () => {
          try {
              const response = await fetch(`http://localhost:8082/get-settings`);
              if (response.ok) {
                  const data = await response.json();
                  if (data.reminders && data.reminders.length > 0) {
                    const userSettings = data.reminders[0];
                    setSettings({
                        language: userSettings.language,
                        theme: userSettings.theme,
                        notification: userSettings.notification  // if stored as 1/0 in DB
                    });
                }
                  console.log("settings:",data)
              }
          } catch (error) {
              console.error('Error loading settings:', error);
          } finally {
              setIsLoading(false);
          }
      };
      
      loadSettings();
  }, [userId]);

  const handleThemeChange = (event) => {
      setSettings(prev => ({
          ...prev,
          theme: event.target.value
      }));
  };

  const handleNotificationsChange = (event) => {
      setSettings(prev => ({
          ...prev,
          notification: event.target.checked
      }));
  };

  const handleLanguageChange = (event) => {
      setSettings(prev => ({
          ...prev,
          language: event.target.value
      }));
  };

  const handleSave = async () => {
      try {
          const response = await fetch('http://localhost:8082/save-settings', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  userId,
                  language: settings.language,
                  theme: settings.theme,
                  notification: settings.notification
              }),
          });
console.log(response)
          if (response.ok) {
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
          } else {
              console.error('Failed to save settings');
          }
      } catch (error) {
          console.error('Error saving settings:', error);
      }
  };

  if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
  }

  return (
      <div className={`settings-page ${settings.theme}`}>
          <Navbar />
          <div className="settings-container">
              <h1 className="settings-header">Account Settings</h1>
              
              <div className="settings-grid">
                  {/* Language Section */}
                  <div className="setting-card">
                      <div className="setting-icon">
                          <FiGlobe />
                      </div>
                      <div className="setting-content">
                          <h2>Language Preference</h2>
                          <p>Select your preferred language for the application</p>
                          <select
                              value={settings.language}
                              onChange={handleLanguageChange}
                              className="modern-select"
                          >
                              <option value="english">English</option>
                              <option value="french">Français</option>
                              <option value="arabic">Arabic</option>
                          </select>
                      </div>
                  </div>

                  {/* Theme Section */}
                  <div className="setting-card">
                      <div className="setting-icon">
                          {settings.theme === 'light' ? <FiSun /> : <FiMoon />}
                      </div>
                      <div className="setting-content">
                          <h2>Theme</h2>
                          <p>Choose how the app looks</p>
                          <div className="theme-options">
                              <label className="theme-option">
                                  <input
                                      type="radio"
                                      name="theme"
                                      value="light"
                                      checked={settings.theme === 'light'}
                                      onChange={handleThemeChange}
                                  />
                                  <div className="theme-preview light">
                                      <span>Light</span>
                                  </div>
                              </label>
                              <label className="theme-option">
                                  <input
                                      type="radio"
                                      name="theme"
                                      value="dark"
                                      checked={settings.theme === 'dark'}
                                      onChange={handleThemeChange}
                                  />
                                  <div className="theme-preview dark">
                                      <span>Dark</span>
                                  </div>
                              </label>
                          </div>
                      </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="setting-card">
                      <div className="setting-icon">
                          <FiBell />
                      </div>
                      <div className="setting-content">
                          <h2>Notifications</h2>
                          <p>Manage your notification preferences</p>
                          <label className="toggle-switch">
                              <input
                                  type="checkbox"
                                  checked={settings.notification}
                                  onChange={handleNotificationsChange}
                              />
                              <span className="slider round"></span>
                              <span className="toggle-label">
                                  {settings.notification ? 'Enabled' : 'Disabled'}
                              </span>
                          </label>
                      </div>
                  </div>
              </div>

              <div className="save-section">
                  <button
                      onClick={handleSave}
                      className="save-button"
                      disabled={isLoading}
                  >
                      <FiSave className="save-icon" />
                      {isLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                  {isSaved && <div className="save-confirmation">Settings saved successfully!</div>}
              </div>
          </div>
      </div>
  );
};

// CSS (can be in a separate file or styled-components)
const styles = `
    .settings-page {
        min-height: 100vh;
        transition: all 0.3s ease;
    }

    .settings-page.light {
        background-color: #f5f7fa;
        color: #333;
            padding-top: 52px;
    padding-right: 20px;
    }

    .settings-page.dark {
        background-color: #1a1a2e;
        color: #f0f0f0;
            padding-top: 52px;
    padding-right: 20px;
    }

    .settings-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .settings-header {
        text-align: center;
        margin-bottom: 2.5rem;
        font-size: 2.2rem;
        color: rgb(25, 118, 210);
        position: relative;
    }

    .settings-header::after {
        content: '';
        display: block;
        width: 80px;
        height: 4px;
        background: rgb(25, 118, 210);
        margin: 0.5rem auto;
        border-radius: 2px;
    }

    .settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
    }

    .setting-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex;
        align-items: flex-start;
    }

    .light .setting-card {
        --card-bg: #ffffff;
    }

    .dark .setting-card {
        --card-bg: #16213e;
    }

    .setting-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .setting-icon {
        font-size: 1.5rem;
        margin-right: 1.2rem;
        color: #2196f3;
        padding: 0.8rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .setting-content {
        flex: 1;
    }

    .setting-content h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.3rem;
    }

    .setting-content p {
        margin: 0 0 1.2rem 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .light .setting-content p {
        --text-secondary: #666;
    }

    .dark .setting-content p {
        --text-secondary: #aaa;
    }

    .modern-select {
        width: 100%;
        padding: 0.8rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background-color: var(--input-bg);
        color: var(--text-primary);
        font-size: 1rem;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        background-size: 1em;
    }

    .light .modern-select {
        --border-color: #ddd;
        --input-bg: #fff;
        --text-primary: #333;
    }

    .dark .modern-select {
        --border-color: #444;
        --input-bg: #1e2a4a;
        --text-primary: #f0f0f0;
    }

    .theme-options {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .theme-option input {
        position: absolute;
        opacity: 0;
    }

    .theme-preview {
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .theme-option input:checked + .theme-preview {
        border-color: #2196f3;
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
    }

    .theme-preview.light {
        background: #ffffff;
        color: #333;
    }

    .theme-preview.dark {
        background: #1a1a2e;
        color: #f0f0f0;
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 30px;
        margin-top: 0.5rem;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #2196f3;
    }

    input:checked + .slider:before {
        transform: translateX(30px);
    }

    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }

    .toggle-label {
        margin-left: 70px;
        font-size: 0.9rem;
        color: var(--text-primary);
    }

    .save-section {
        text-align: center;
        margin-top: 2rem;
        position: relative;
    }

    .save-button {
        display: inline-flex;
        align-items: center;
        padding: 0.8rem 2rem;
        font-size: 1rem;
        font-weight: 500;
        color: white;
        background-color: #2196f3;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .save-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        background-color: var(--primary-dark);
    }

    .save-icon {
        margin-right: 0.5rem;
    }

    .save-confirmation {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success-bg);
        color: var(--success-text);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        animation: fadeIn 0.3s ease;
    }

    .light .save-confirmation {
        --success-bg: #d4edda;
        --success-text: #155724;
    }

    .dark .save-confirmation {
        --success-bg: #1a3a1e;
        --success-text: #a3d9a5;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .settings-grid {
            grid-template-columns: 1fr;
        }

        .settings-container {
            padding: 1.5rem;
        }
    }

    @media (max-width: 480px) {
        .settings-header {
            font-size: 1.8rem;
        }

        .theme-options {
            flex-direction: column;
        }

        .setting-card {
            flex-direction: column;
        }

        .setting-icon {
            margin-bottom: 1rem;
            margin-right: 0;
        }
    }
`;

// Add styles to the head
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default Settings;