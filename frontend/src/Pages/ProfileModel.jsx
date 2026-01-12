import React from "react";
import userImg from "../assets/user.png";
import { X } from "lucide-react";

const ProfileModal = ({ user, closeModal }) => {
  if (!user) return null;

 // console.log("user in ProfileModal:", JSON.stringify(user));
  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded-lg p-4 relative animate-scaleIn">

        {/* close button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-2 text-white z-100 hover:text-red-500"
        >
          <X />
        </button>

        {/* profile image */}
        <div
          className="relative h-40 rounded-lg mb-14 flex justify-center items-end"
          style={{
            backgroundImage: user?.profile?.cover_photo ? `url(http://localhost:8000/storage/${user?.profile?.cover_photo})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: user?.profile?.cover_photo ? "transparent" : "#e5e7eb",
          }}
        >
          <img
            src={user?.profile?.avatar ? `http://localhost:8000/storage/${user.profile.avatar}` : userImg}
            className="w-24 h-24 rounded-full shadow-2xl object-cover border-4 border-white absolute -bottom-12"
            alt="avatar"
          />
        </div>

          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>

          {/* extra info */}
          {user.profile && (
            <div className="text-sm text-gray-700 mt-2">
              <p><b>Phone:</b> {user.profile.phone ?? "N/A"}</p>
              <p><b>Bio:</b> {user.profile.bio ?? "N/A"}</p>
            </div>
          )}
        </div>
      </div>

  );
};

export default ProfileModal;
