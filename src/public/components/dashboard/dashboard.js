import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { decrypt } from "../../../encryption/Encryption";
import { AlertMessage } from "../StyledComponents";
import LogoutConfirmationModal from "../../../components/LogoutConfirmationModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUserAuthenticated = sessionStorage.getItem("ans-sms") || "";
  const [sessionMessage, setSessionMessage] = useState(
    location.state?.warning || ""
  );
  const [successMessage, setSuccessMessage] = useState(
    location.state?.success || ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /**
   * A flash message incase a logged in user wants to login again.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSessionMessage("");
      setSuccessMessage("");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [sessionMessage, successMessage]);

  /**
   * Redirect to the login page if the user is not authenticated
   */
  useEffect(() => {
    if (isUserAuthenticated === "") {
      sessionStorage.removeItem("ans-sms");
      navigate("/login", {
        state: {
          warning: "Please login to access page!",
        },
      });
    }
  }, [isUserAuthenticated, navigate]);

  if (isUserAuthenticated === "") {
    return null;
  }

  let userInfo;

  try {
    userInfo = decrypt(isUserAuthenticated);
  } catch (error) {
    setErrorMessage("Error while parsing JSON");
  }

  // Incase the user tampers with the session storage
  // Redirect to the login page
  if (!userInfo) {
    sessionStorage.removeItem("ans-sms");
    navigate("/login", {
      state: {
        warning: "Please login to access page again.",
      },
    });
    return null;
  }

  const handleLogout = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Clear the localStorage
    localStorage.removeItem("ans-sms");

    // Clear the session storage
    sessionStorage.removeItem("ans-sms");
    navigate("/login");
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="flex lg:flex-nowrap flex-wrap xl:px-24 lg:p-16 md:p-8 p-4 pt-16 bg-sky-50">
      <div className="flex flex-col w-full items-center py-4 md:py-10">
        {sessionMessage && (
          <AlertMessage alertType="warning" message={sessionMessage} />
        )}
        {successMessage && (
          <AlertMessage alertType="success" message={successMessage} />
        )}
        <div className="flex flex-col gap-4">
          <div className="lg:text-lg">
            Hello {userInfo ? userInfo.username.toUpperCase() : "Guest"}
          </div>

          <button
            type="button"
            className="bg-skyblue text-white px-3 py-1 rounded hover:bg-blue-400"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      <div>{errorMessage && <p>{errorMessage}</p>}</div>
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
};

export default Dashboard;
