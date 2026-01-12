import React, { useState } from "react";
import userImg from "../assets/user.png";
import ProfileModal from "./ProfileModel";

const ReceiveMessage = ({ message, time, messageData,selectedUsers ,profile , setSelectedUserProfile }) => {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("user"));

  const isSender = messageData.sender_id === authUser.id; // sender message
  console.log(messageData?.sender)
  

  return (
    <div className={`flex gap-2 mb-3 ${isSender ? "justify-end" : "justify-start"}`}>
      {/* Only show avatar if receiver message */}
      {!isSender && (
        <img
          src={
            selectedUsers?.profile?.avatar
              ? `http://localhost:8000/storage/${selectedUsers?.profile.avatar}`
              : userImg
          }
          className="w-10 h-10 rounded-full object-cover"
        />
      )}

      <div
        className={`${
          isSender ? "bg-blue-600 text-white rounded-tr-xl rounded-tl-xl rounded-bl-xl max-w-xs" 
                   : "bg-pink-500 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl max-w-xs"
        } p-3`}
      >
        {/* Image */}
        {messageData.image && !messageData.deleted_at && (
          <img
            src={`http://localhost:8000/storage/${messageData.image}`}
            className="w-4 mb-2 rounded"
          />
        )}

        {/* Text / deleted */}
        {messageData.deleted_at ? (
          <p className="italic text-gray-200">This message was deleted</p>
        ) : (
          <p>
            {messageData.message}
            {messageData.is_edited === 1 && (
              <small className="ml-1 text-xs">(edited)</small>
            )}
          </p>
        )}

        {/* Sender name for receiver messages */}
        {!isSender && (
          <p className="text-xs text-gray-200 mt-1 cursor-pointer" onClick={() => setOpenProfileModal(true)}>
            From: <span className="text-blue-200 font-semibold" onClick={()=>{setSelectedUserProfile(selectedUsers)}}>{messageData?.sender?.name || "Unknown"}</span>
          </p>
        )}

        {/* Time */}
        <span className="text-xs text-gray-200 block mt-1">{time}</span>
      </div>

      {/* Profile Modal */}
      {openProfileModal && profile && (
        <ProfileModal user={profile} closeModal={() => setOpenProfileModal(false)} />
      )}
    </div>
  );
};

export default ReceiveMessage;
