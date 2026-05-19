import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Menu, X, User, LogOut, Bell } from "lucide-react";
import { Avatar, Menu as MuiMenu, MenuItem, IconButton, Badge } from "@mui/material";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";
import finlearnLogo from "../../asset/apple-touch-icon.png";

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const [user, setUser] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const getUserInfo = async () => {
    const data = { url: apis().getUserProfile };
    const result = await httpAction(data);
    if (result?.status) {
      setUser(result.user || {});
    }
  };

  useEffect(() => {
    // Add a small delay to ensure we get the latest profile data
    const timer = setTimeout(() => {
      getUserInfo();
    }, 200);

    // Refresh user data when profile is updated
    const handleProfileUpdated = () => {
      // Add delay to ensure server has persisted the changes
      setTimeout(() => {
        getUserInfo();
      }, 500);
    };

    // Listen for custom event when profile is updated
    window.addEventListener('profileUpdated', handleProfileUpdated);

    // Also listen for storage events (in case of multiple tabs)
    window.addEventListener('storage', () => {
      setTimeout(() => {
        getUserInfo();
      }, 300);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('profileUpdated', handleProfileUpdated);
      window.removeEventListener('storage', () => { });
    };
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const logoutHandler = async () => {
    const data = { url: apis().logout };
    const result = await httpAction(data);
    if (result?.status) {
      toast.success("Logged out successfully");
      navigate("/");
    }
    handleProfileMenuClose();
  };

  const open = Boolean(anchorEl);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-sm" role="navigation" aria-label="Dashboard top navigation">
      <div className="max-w-full mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Sidebar Toggle for Mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-2"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-3 hover:opacity-80 transition"
            aria-label="Go to dashboard home"
          >
            <img
              src={finlearnLogo}
              alt="FinLearn Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">FinLearn</span>
          </button>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                className="p-0"
              >
                <Avatar
                  src={user?.profileImage}
                  sx={{
                    bgcolor: "teal",
                    width: 40,
                    height: 40,
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                >
                  {user?.name?.substring(0, 1) || "U"}
                </Avatar>
              </IconButton>
            </div>
          </div>
        </div>

      </div>

      {/* Profile Dropdown Menu */}
      <MuiMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => { navigate("/dashboard/profile"); handleProfileMenuClose(); }}>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Profile
          </div>
        </MenuItem>
        <MenuItem onClick={logoutHandler}>
          <div className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </div>
        </MenuItem>
      </MuiMenu>
    </nav>
  );
};

export default Navbar;