import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Commercial Operations Platform
        </h1>
        <p className="text-gray-600">
          React is working! If you can see this, the frontend is loading correctly.
        </p>
        <div className="mt-4">
          <a
            href="/admin/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Go to Admin
          </a>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;