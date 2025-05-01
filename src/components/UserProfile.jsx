import React from 'react';
import { useAppContext } from '../context/AppContext'; // Import the custom hook to access context

const UserProfile = () => {
  const { user, loading, error } = useAppContext(); // Consume the context (user data, loading, error)

  // Conditional rendering based on loading and error states
  if (loading) {
    return <div>Loading user data...</div>; // Show loading message while data is being fetched
  }

  if (error) {
    // Check if error is an object and display more detailed error message
    const errorMessage = error.message || 'An unknown error occurred';
    return <div>Error: {errorMessage}</div>; // Show error message if there's an issue fetching data
  }

  // Once data is loaded, display user profile information
  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {user?.name || 'No name available'}</p>  {/* Display user's name or fallback text */}
      <p>Email: {user?.email || 'No email available'}</p>  {/* Display user's email or fallback text */}
    </div>
  );
};

export default UserProfile; // Export the component
