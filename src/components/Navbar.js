import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [analytics, setAnalytics] = useState(null); // State to store analytics data
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://192.168.1.36:5001/analytics', {
          headers: {
            Authorization: `Bearer ${token}` // Include token for authentication if necessary
          }
        });
        setAnalytics(response.data); // Set the analytics data to state
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); // Update state immediately
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="shadow mb-2">
      <div className="relative flex max-w-screen-xl flex-col overflow-hidden px-4 py-4 md:mx-auto md:flex-row md:items-center">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://manlitics.ae/wp-content/uploads/2021/01/MANLITICS-LOGOn.png" className="h-10 w-40" alt="Manlitics Logo" />
        </a>

        <input type="checkbox" className="peer hidden" id="navbar-open" />
        <label
          className="absolute top-5 right-7 cursor-pointer md:hidden"
          htmlFor="navbar-open"
        >
          <span className="sr-only">Toggle Navigation</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
        <nav
          aria-label="Header Navigation"
          className="peer-checked:mt-8 peer-checked:max-h-56 flex max-h-0 w-full flex-col items-center justify-between overflow-hidden transition-all md:ml-24 md:max-h-full md:flex-row md:items-start"
        >
          <ul className="flex flex-col items-center space-y-2 md:ml-auto md:flex-row md:space-y-0">
            {/* <li className="text-gray-600 md:mr-12 hover:text-blue-600">
              <a href="/feature">Features</a>
            </li>
            <li className="text-gray-600 md:mr-12 hover:text-blue-600">
              <a href="/support">Support</a>
            </li> */}

            {/* Analytics display */}
            {analytics && (
              <li className="text-black md:mr-12 hover:text-blue-600">
                <div className=" text-black rounded-md px-4 py-2">
                  <span>Total Emails: {analytics.total_email_credits_used}</span>
                  <span className="ml-4">Used Today: {analytics.used_today}</span>
                  <span className="ml-4">Deliverable: {analytics.deliverable_count}</span> {/* New span for deliverable count */}
                  <span className="ml-4">Undeliverable: {analytics.undeliverable_count}</span> {/* New span for undeliverable count */}
                  <span className="ml-4">Unknown: {analytics.unknown_count}</span> {/* New span for undeliverable count */}
                </div>

              </li>
            )}

            <li className="text-gray-600 md:mr-12 hover:text-blue-600">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="rounded-md border-2 border-blue-600 px-6 py-1 font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="rounded-md border-2 border-blue-600 px-6 py-1 font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
