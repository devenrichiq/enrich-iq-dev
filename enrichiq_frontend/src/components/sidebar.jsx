/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { Link } from "react-router-dom";
import useCredits from "../hooks/useCredits";
import "react-toastify/dist/ReactToastify.css";
import { lineSpinner } from "ldrs";
import { useEffect, useState } from "react";

function Sidebar(props) {
  lineSpinner.register();

  const { credits, loading } = useCredits();
  const [isLowCredits, setIsLowCredits] = useState(false);

  useEffect(() => {
    if (credits === 0 || credits < 100) {
      setIsLowCredits(true);
    } else {
      setIsLowCredits(false);
    }
  }, [credits]);

  return (
    <div>
      <nav className="fixed top-0 z-50 w-full border-b border-[#343434] bg-[#1c1c1c]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex justify-between items-center text-white font-medium text-xl w-full">
              <Link to="/">
                <h4>Enrich IQ</h4>
              </Link>
              {loading ? (
                <div className="bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
                  ? Credits Left
                </div>
              ) : isLowCredits ? (
                <div className="bg-[#37996B] border-[0.4px] border-[#37996B] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
                  {credits || 0} Credits Left!
                </div>
              ) : (
                <div className="bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
                  {credits || 0} Credits
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* sidebar actual */}
      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-24 transition-transform -translate-x-full border-r border-[#343434] sm:translate-x-0 bg-[#1c1c1c]"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto flex flex-col bg-[#1c1c1c]">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/"
                className="flex items-center p-2 rounded-lg text-white hover:border-[#343434] hover:border border border-transparent group"
              >
                <svg
                  className="w-5 h-5 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
                  />
                </svg>
                <div className="ms-3 text-base font-normal tracking-wider">
                  Scrape Apollo
                </div>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center p-2 rounded-lg text-white hover:border-[#343434] hover:border border border-transparent group"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-gray-900 dark:group-hover:text-white transition duration-75"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ms-3 text-base font-normal tracking-wider">
                  Settings
                </div>
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="flex items-center p-2 rounded-lg text-white hover:border-[#343434] hover:border border border-transparent group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                  />
                </svg>
                <div className="ms-3 text-base font-normal tracking-wider">
                  Logout
                </div>
              </Link>
            </li>
          </ul>
          <div className="mt-auto mb-4"></div>
        </div>
      </aside>

      <div className="sm:ml-64">{props.bodyContent}</div>
    </div>
  );
}

export default Sidebar;
