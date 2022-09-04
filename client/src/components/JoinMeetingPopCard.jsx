import React, {useState} from "react"


import { useNavigate } from "react-router-dom";

const JoinMeetingPopCard = ({ closeModal }) => {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  return (
    <>
      <div
        tabIndex={-1}
        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full justify-center items-center flex"
        aria-modal="true"
        role="dialog"
      >
        <div className="relative p-4 w-full max-w-md h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-2.5 text-black rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg
                aria-hidden="true"
                className="mx-auto mb-4 w-14 h-14 text-black dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <label
                  htmlFor="text"
                  className="block mb-2 text-sm font-medium text-black dark:text-gray-300"
                >
                  Paste joining link
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e)=>setLink(e.target.value)}
                  className="border border-black text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400"
                  placeholder="name@company.com"
                  required=""
                />
              </div>
              <button
                data-modal-toggle="popup-modal"
                type="button"
                onClick={() => {
                  navigate("room/" + link.substring(link.lastIndexOf('/')+1, link.length));
                }}
                className="text-black my-3 mr-4 bg-red-600 border focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
              >
                &nbsp; Join &nbsp;
              </button>
              <button
                data-modal-toggle="popup-modal"
                onClick={closeModal}
                type="button"
                className="text-black ml-4 bg-white focus:ring-4 focus:outline-none  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default JoinMeetingPopCard
