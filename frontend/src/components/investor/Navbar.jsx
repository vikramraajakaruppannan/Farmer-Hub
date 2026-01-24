// src/components/investor/Navbar.jsx
import React, { useState, useEffect } from "react";
import {
  Leaf,
  User,
  Menu,
  X,
  Mail,
  Phone,
  Briefcase,
  Settings,
  LogOut,
  ChevronRight,
  Camera,
  Save,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const AgriTechNavbarWithProfile = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo_url: null,
  });

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const navLinks = [
    { to: "/invest", label: "Home" },
    { to: "/properties", label: "My Properties" },
    { to: "/document-review", label: "Document Review" },
  ];

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api("/profile");

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed: ${response.status} - ${text.substring(0, 200)}`);
      }

      const data = await response.json();
      const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();

      setUserData({
        name: fullName || "Landowner",
        email: data.email || "Not provided",
        phone: data.mobile || "Not provided",
        address: data.address || "Not provided",
        photo_url: data.photo_url || null,
      });

      setEditData({
        name: fullName,
        email: data.email || "",
        phone: data.mobile || "",
        address: data.address || "",
      });
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileOpen && !settingsOpen) {
      fetchProfile();
    }
  }, [profileOpen, settingsOpen]);

  const NavLinkItem = ({ to, label, mobile = false }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        onClick={() => mobile && setMobileOpen(false)}
        className={`
          relative group transition-all duration-300
          ${
            mobile
              ? "text-base py-3 px-4 rounded-lg hover:bg-green-50 block"
              : "text-sm py-2"
          }
          ${
            isActive
              ? "text-green-800 font-semibold"
              : "text-gray-600 hover:text-green-700 font-medium"
          }
        `}
      >
        <span className="relative z-10">{label}</span>

        {!mobile && (
          <span
            className={`
              absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-600 to-green-700
              transition-all duration-300 ease-out
              ${isActive ? "w-full" : "w-0 group-hover:w-full"}
            `}
          />
        )}

        {mobile && isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-700 rounded-r-full" />
        )}
      </Link>
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );

  const handleSave = async () => {
    try {
      const [first_name, ...lastNameParts] = editData.name.trim().split(" ");
      const last_name = lastNameParts.join(" ") || "";

      const payload = {
        first_name: first_name || null,
        last_name: last_name || null,
        mobile: editData.phone.replace(/^\+91\s?/, "").trim() || null,
        address: editData.address.trim() || null,
      };

      const response = await api("/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Save failed: ${text}`);
      }

      alert("Profile updated successfully!");
      await fetchProfile();
      setSettingsOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes.");
    }
  };

  const handleCancel = () => {
    setEditData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
    });
    setSettingsOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api("/profile/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${text}`);
      }

      const data = await response.json();
      setUserData((prev) => ({ ...prev, photo_url: data.photo_url }));
      alert("Profile photo updated!");
    } catch (err) {
      console.error("Photo upload error:", err);
      alert("Failed to upload photo");
    }
  };

  const handleDeletePhoto = async () => {
    if (!userData.photo_url) return;

    const confirmed = window.confirm("Remove your profile photo?");
    if (!confirmed) return;

    try {
      const response = await api("/profile/photo", {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Delete failed: ${text}`);
      }

      setUserData((prev) => ({ ...prev, photo_url: null }));
      alert("Profile photo deleted successfully!");
    } catch (err) {
      console.error("Photo delete error:", err);
      alert("Failed to delete photo");
    }
  };

  const handleSignOut = async () => {
  try {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      // No session anyway
      localStorage.clear();
      navigate("/login");
      return;
    }

    const response = await api("/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }), // ← Send session_id
    });

    if (!response.ok) {
      console.warn("Logout API failed, forcing client logout");
    }

    // Always clear client state
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();

    alert("Signed out successfully!");
    setProfileOpen(false);
    navigate("/login", { replace: true });
  } catch (err) {
    console.error("Logout error:", err);
    // Force logout even if API fails
    localStorage.clear();
    sessionStorage.clear();
    alert("Signed out locally.");
    navigate("/login", { replace: true });
  }
};

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg shadow-gray-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/invest"
              className="group flex items-center gap-2 text-2xl font-bold transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Leaf className="w-8 h-8 text-green-700 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="bg-gradient-to-r from-green-700 to-green-800 bg-clip-text text-transparent tracking-wide">
                AgriTech
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLinkItem key={link.to} {...link} />
              ))}
            </nav>

            <div className="hidden md:flex items-center">
              <button
                onClick={() => setProfileOpen(true)}
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-green-700 hover:bg-green-50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="relative z-10 text-sm font-semibold text-gray-700 group-hover:text-green-800">
                  Profile
                </span>
              </button>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden relative w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                    mobileOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${
                    mobileOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                    mobileOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden bg-white border-t border-gray-100 transition-all duration-300 ease-in-out ${
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 space-y-1">
            {navLinks.map((link) => (
              <NavLinkItem key={link.to} {...link} mobile />
            ))}

            <button
              onClick={() => {
                setProfileOpen(true);
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-green-50 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-700 group-hover:text-green-800">
                Profile
              </span>
            </button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setProfileOpen(false);
              setSettingsOpen(false);
            }}
          />

          <div className="relative w-96 bg-white shadow-2xl h-full overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={fetchProfile}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : settingsOpen ? (
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-br from-green-700 to-green-800 p-6 text-white">
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="mb-4 text-white/80 hover:text-white flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Profile
                  </button>
                  <h2 className="text-2xl font-bold">Account Settings</h2>
                  <p className="text-white/80 mt-1">
                    Update your personal information
                  </p>
                </div>

                <div className="flex-1 p-8 space-y-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
                        {userData.photo_url ? (
                          <img
                            src={userData.photo_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userData.name[0] || "I"
                        )}
                      </div>

                      {/* Upload button */}
                      <label className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-gray-100 transition">
                        <Camera className="w-5 h-5 text-green-700" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>

                      {/* Delete button (only if photo exists) */}
                      {userData.photo_url && (
                        <button
                          type="button"
                          onClick={handleDeletePhoto}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Click camera to upload or trash to remove photo
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={editData.address}
                        onChange={(e) =>
                          setEditData({ ...editData, address: e.target.value })
                        }
                        rows={3}
                        placeholder="Your full address..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative bg-gradient-to-br from-green-700 to-green-800 p-6 pb-20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

                  <div className="relative flex justify-between items-start">
                    <h3 className="text-white text-lg font-bold">Profile</h3>
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200 hover:rotate-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                      <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
                        {userData.photo_url ? (
                          <img
                            src={userData.photo_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-green-700">
                            {userData.name[0] || "I"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-16 px-6 pb-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-gray-800">
                      {userData.name || "Landowner"}
                    </h4>
                    <p className="text-lg text-green-700 font-medium">
                      Land Provider
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-6">
                    <InfoRow
                      icon={<Mail className="w-5 h-5" />}
                      label="Email"
                      value={userData.email}
                    />
                    <InfoRow
                      icon={<Phone className="w-5 h-5" />}
                      label="Phone"
                      value={userData.phone}
                    />
                    <InfoRow
                      icon={<Briefcase className="w-5 h-5" />}
                      label="Address"
                      value={userData.address}
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5" />
                        <span>Account Settings</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-xl hover:bg-red-50 text-red-600 font-medium transition"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AgriTechNavbarWithProfile;
