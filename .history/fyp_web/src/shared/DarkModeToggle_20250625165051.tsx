import React, { useState, useEffect } from 'react';

import './DarkMode.css';



const DarkModeToggle = () => {

  const [isDarkMode, setIsDarkMode] = useState(() => {

    const savedMode = localStorage.getItem('darkMode');

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return savedMode === 'true' ? true : (savedMode === 'false' ? false : systemPrefersDark);

  });



  useEffect(() => {

    if (isDarkMode) {

      document.documentElement.classList.add('dark');

      document.documentElement.classList.remove('light');

      localStorage.setItem('darkMode', 'true');

    } else {

      document.documentElement.classList.remove('dark');

      document.documentElement.classList.add('light');

      localStorage.setItem('darkMode', 'false');

    }

  }, [isDarkMode]); // Re-run effect when isDarkMode changes



  const handleToggle = () => {

    setIsDarkMode(prevMode => !prevMode); // Toggle the state

  };



  // SVG paths for sun and moon icons

  const sunPath = "M55 27.5C55 42.6878 42.6878 55 27.5 55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5Z";

  const moonPath = "M17.5 28C17.5 43.1878 28.5681 55.5 27.5 55.5C12.3122 55.5 0 43.1878 0 28C0 12.8122 12.3122 0.5 27.5 0.5C27.5 0.5 17.5 12.8122 17.5 28Z";



  return (

    <label className="switch">

      <input

        type="checkbox"

        checked={isDarkMode}

        onChange={handleToggle}

      />

      <span className="slider round">

        <svg className="toggle-icon" viewBox="0 0 55 55">

          {/* Render sun or moon path based on dark mode state */}

          <path d={isDarkMode ? moonPath : sunPath} />

        </svg>

      </span>

    </label>

  );

};



export default DarkModeToggle;