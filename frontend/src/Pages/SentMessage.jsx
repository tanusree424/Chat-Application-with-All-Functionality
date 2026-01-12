import React from "react";

const SentMessage = ({
  message,
  
  time,
  messageData,
  onEdit,
  selectedUsers,
  onDelete,
}) => {
  const authUser = JSON.parse(localStorage.getItem("user"));
  
// console.log(selectedUsers)
  return (
    <>
    <div className="bg-blue-500 p-4 mb-3 text-white rounded-br-xl ml-auto w-80">
      
      {/* 🔹 Message body */}
      {messageData.deleted_at ? (
        <p className="italic text-gray-200">
          This message was deleted
        </p>
      ) : (
        <p>
          {messageData.message}
          {messageData.is_edited===1 && (
            <small className="text-xs ml-1 text-gray-200">
              (edited)
            </small>
          )}
        </p>
      )}

      {/* 🔹 Time */}
      <div className="text-xs text-gray-200 mt-1">
        {time}
      </div>

      {/* 🔹 Edit / Delete buttons (only sender & not deleted) */}
      {messageData.sender_id === authUser.id &&
        !messageData.deleted_at && (
          <div className="flex gap-2 text-xs text-gray-300 mt-1">
            <button
              className="hover:text-white cursor-pointer"
              onClick={() => onEdit(messageData)}
            >
              Edit
            </button>

            <button
              className="hover:text-red-200 cursor-pointer"
              onClick={() => onDelete(messageData.id)}
            >
              Delete
            </button>
          </div>
        )}
        
    </div>
    {
          messageData.markAsRead === 1 && (
            <div className="flex justify-end p-2">
          <img className="w-4 h-4 rounded-full object-contain" src={`http://localhost:8000/storage/${selectedUsers?.profile?.avatar}`} alt="" />
          </div>

          )
        }
        </>
  );
};

export default SentMessage;
