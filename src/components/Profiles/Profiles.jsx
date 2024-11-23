import React, { useState, useEffect } from "react";
import "./Profiles.css"; // Import the new CSS file
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import axios from "axios"; // Import axios for making API calls

function Profiles({ userEmail }) {
  const [profiles, setProfiles] = useState([]); // Start with an empty array
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editedProfileName, setEditedProfileName] = useState("");
  const navigate = useNavigate(); // Hook for navigating to other routes

  // Fetch existing profiles from the backend when component mounts
  useEffect(() => {
    async function fetchProfiles() {
      try {
        const response = await axios.get(
          `${process.env.API_BASE_URL}/profiles`,
          {
            params: { email: userEmail }, // Send userEmail as a query parameter
            withCredentials: true,
          }
        );

        const fetchedProfiles = response.data;

        // Always include Guest profile
        const guestProfile = { profile_id: 1, profile_name: "Guest" };

        // Add Guest profile only if it's not present
        const updatedProfiles = [guestProfile, ...fetchedProfiles];

        setProfiles(updatedProfiles); // Set profiles including Guest
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    }

    fetchProfiles();
  }, [userEmail]); // Add userEmail as a dependency

  // Handle adding a new profile
  async function handleAddProfile() {
    if (newProfileName.trim() === "") {
      alert("Profile name cannot be empty.");
      return; // Prevent adding empty profile
    }

    try {
      const userResponse = await axios.get(
        `${process.env.API_BASE_URL}/auth/status`,
        {
          withCredentials: true,
        }
      );

      if (userResponse.data.authenticated) {
        const userEmail = userResponse.data.email;

        // Get the user_id from the database based on the email
        const userResult = await axios.get(
          `${process.env.API_BASE_URL}/users`,
          {
            params: { email: userEmail },
            withCredentials: true,
          }
        );

        if (userResult.data && userResult.data.user_id) {
          const newProfile = {
            user_id: userResult.data.user_id,
            profile_name: newProfileName,
          };

          const response = await axios.post(
            `${process.env.API_BASE_URL}/profiles`,
            newProfile,
            { withCredentials: true }
          );

          if (response.status === 201) {
            // Update profiles and include the new profile
            setProfiles([...profiles, response.data]);
            setNewProfileName(""); // Clear input
          } else {
            console.error("Failed to add profile");
          }
        } else {
          console.error("User ID not found");
        }
      } else {
        console.error("User is not authenticated");
      }
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  }

  // Handle deleting a profile
  async function handleDeleteProfile(id) {
    if (id === 1) {
      alert("You cannot delete the Guest profile");
      return;
    }

    try {
      await axios.delete(`${process.env.API_BASE_URL}/profiles/${id}`, {
        withCredentials: true,
      });
      const updatedProfiles = profiles.filter(
        (profile) => profile.profile_id !== id
      );
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  }

  // Handle editing a profile
  function handleEditProfile(profile) {
    if (profile.profile_name === "Guest") {
      alert("You cannot edit the Guest profile");
      return;
    }

    setEditingProfileId(profile.profile_id);
    setEditedProfileName(profile.profile_name);
  }

  // Handle saving the edited profile
  async function handleSaveProfile(id) {
    const updatedProfile = { profile_id: id, profile_name: editedProfileName };

    try {
      await axios.put(`${process.env.API_BASE_URL}/profiles`, updatedProfile, {
        withCredentials: true,
      });
      const updatedProfiles = profiles.map((profile) =>
        profile.profile_id === id
          ? { ...profile, profile_name: editedProfileName }
          : profile
      );
      setProfiles(updatedProfiles);
      setEditingProfileId(null);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }

  // Handle navigating to MovieSearch on profile click
  function handleProfileClick(profile) {
    // Only navigate if the profile is not currently being edited
    if (editingProfileId === null) {
      navigate("/movies-search", {
        state: {
          profileName: profile.profile_name,
          profileId: profile.profile_id,
        },
      });
    }
  }

  return (
    <div className="profiles-container">
      <h1 className="profiles-heading">Who's Watching?</h1>

      <div className="profiles-list">
        {profiles.map((profile) => (
          <div
            key={profile.profile_id}
            className="profile-box"
            style={{ marginBottom: "10px", cursor: "pointer" }}
            onClick={() => handleProfileClick(profile)}
          >
            {editingProfileId === profile.profile_id ? (
              <input
                type="text"
                value={editedProfileName}
                onChange={(e) => setEditedProfileName(e.target.value)}
                className="profile-input"
              />
            ) : (
              <p className="profile-name">{profile.profile_name}</p>
            )}

            {editingProfileId === profile.profile_id ? (
              <button
                className="profile-save-button"
                onClick={() => handleSaveProfile(profile.profile_id)}
              >
                Save
              </button>
            ) : (
              <button
                className="profile-edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProfile(profile);
                }}
              >
                🖋️
              </button>
            )}

            <button
              className="profile-delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProfile(profile.profile_id);
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="add-profile-container">
        <input
          type="text"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          className="profile-input"
          placeholder="Enter new profile name"
        />
        <button className="add-profile-button" onClick={handleAddProfile}>
          Add Profile
        </button>
      </div>
    </div>
  );
}

export default Profiles;
