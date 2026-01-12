import React, { useEffect, useState, useRef } from "react";
import { MousePointer2, ArrowLeft, Smile, CameraIcon } from "lucide-react";
import SentMessage from "./SentMessage";
import ReceiveMessage from "./ReceiveMessage";
import { Api } from "../Api/Api";
import echo from "../lib/Echo";
import userImg from "../assets/user.png";
import EmojiPicker from "emoji-picker-react";

const MessageArea = ({
  setSelectedUsers,
  setSelectedUserProfile,
  openProfileModal,
  setOpenProfileModal,
  userTypingId,
  handleTyping,
  selectedUsers,
  OnlineUsers,
  lastSeen,
  getMessage,
  Messages,
  
  setMessages,
}) => {
  const authUser = JSON.parse(localStorage.getItem("user"));

  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const [profile, setProfile] = useState(null);


  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);


  /* profile */
  useEffect(() => {
    setProfile(selectedUsers?.profile || null);
  }, [selectedUsers]);

  /* fetch messages */
  useEffect(() => {
    if (selectedUsers?.id) getMessage();
  }, [selectedUsers?.id]);

  /* auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [Messages]);



  
 const onEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.message);
  };

  /* ===============================
      ❌ DELETE MESSAGE
  =============================== */
  const onDelete = async (id) => {
    try {
      await Api.delete(`/api/delete-message/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, deleted_at: true } : msg
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* === 
  ================== SEND MESSAGE ===================== */
const sendMessage = async () => {
  if (!newMessage.trim() && !image) return;

  /* ===================== ✏️ EDIT MESSAGE ===================== */
  if (editingMessage) {
    try {
      const res = await Api.put(
        `/api/edit-message/${editingMessage.id}`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // update message locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage.id ? res.data : msg
        )
      );

      setEditingMessage(null);
      setNewMessage("");
      setShowEmoji(false);
      return; // ⛔ stop here, don’t go to send new
    } catch (err) {
      console.log("Edit failed:", err);
      return;
    }
  }

  /* ===================== 📤 SEND NEW MESSAGE ===================== */

  const tempId = Date.now();

  // 🔹 Step 1: Instant temp message
  const tempMessage = {
    id: tempId,
    sender_id: authUser.id,
    receiver_id: selectedUsers.id,
    message: newMessage,
    image: image || null,
    markAsRead: 0,
    temp: true,
  };

  setMessages((prev) => [...prev, tempMessage]);

  setNewMessage("");
  setImage(null);
  setShowEmoji(false);

  // 🔹 Step 2: Backend call
  const formData = new FormData();
  formData.append("sender_id", authUser.id);
  formData.append("receiver_id", selectedUsers.id);
  formData.append("message", tempMessage.message);
  if (image) formData.append("image", image);

  try {
    const res = await Api.post("/api/send-message", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // 🔥 Step 3: Force correct sender
    const fixedMessage = {
      ...res.data,
      sender_id: authUser.id,
    };

    // 🔹 Step 4: Replace temp message with real one
    setMessages((prev) =>
      prev.map((msg) => (msg.id === tempId ? fixedMessage : msg))
    );
  } catch (error) {
    console.log("Message send failed:", error);

    // remove temp message if failed
    setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
  }
};




useEffect(() => {
  if (!authUser?.id) return;

  const channel = `chat.${authUser.id}`;
  const chat = echo.private(channel);

  chat.listen("MessageSent", (e) => {
    // যদি আমার নিজের message হয় → ignore
    if (e.message.sender_id === authUser.id) return;

    setMessages((prev) => {
      if (prev.some((m) => m.id === e.message.id)) return prev;
      return [...prev, e.message];
    });
  });

  chat.listen("MessageEdited", (e) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === e.message.id ? e.message : m))
    );
  });

  chat.listen("MessageDeleted", (e) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === e.messageId ? { ...m, deleted_at: true } : m
      )
    );
  });
  chat.listen("MessageSeenEvent", (e) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === e.message_id ? { ...msg, markAsRead: 1 } : msg
          )
        );
      });

  return () => {
    echo.leave(`private-${channel}`);
  };
}, [authUser?.id]);

const fromatTime = (timestamps)=>{
 const date = new Date(timestamps);
 const now = new Date();
 const isToday = date.toLocaleDateString() === now.toLocaleDateString();
const time = date.toLocaleTimeString([], {
  hour:"2-digit",
  minute:"2-digit"
 });
 if (isToday) {
  return `today ${time} `
 }

 const yesterday = new Date();
 yesterday.setDate(now.getDate()-1);
 const isYesterday = date.toLocaleDateString() === yesterday.toLocaleDateString();
 

 if (isYesterday) {
  return `Yesterday ${time}`
 }

 return `${date.toLocaleDateString()} ${time}`

}



  if (!selectedUsers) {
    return (
      <div className="h-full flex items-center justify-center">
        Select a user to start chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="bg-pink-700 p-4 text-white flex items-center gap-3">
        <ArrowLeft
          className="cursor-pointer"
          onClick={() => setSelectedUsers(null)}
        />

        <img
        onClick={()=> setSelectedUserProfile(selectedUsers)}
          src={
            profile?.avatar
              ? `http://localhost:8000/storage/${profile.avatar}`
              : userImg
          }
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <span className="font-semibold">{selectedUsers.name}</span>

          <small className="text-xs text-pink-200">
            {userTypingId === selectedUsers.id ? (
              <span className="text-green-300">Typing...</span>
            ) : OnlineUsers.includes(selectedUsers.id) ? (
              "Online"
            ) :  lastSeen[selectedUsers.id] ? `Last Seen ${fromatTime(lastSeen[selectedUsers.id])} `: `Last Seen ${fromatTime(selectedUsers.last_seen)}` }
          </small>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-200">
        {Messages.map((msg) =>
          msg.sender_id === authUser.id ? (
            <SentMessage key={msg.id}onEdit={onEdit} onDelete={onDelete}   selectedUsers={selectedUsers}  messageData={msg} />
          ) : (
            <ReceiveMessage key={msg.id} selectedUsers={selectedUsers} setSelectedUserProfile={setSelectedUserProfile} messageData={msg} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

        {/* 🔹 Input */}
      <div className="p-3 bg-white border-t flex items-center gap-2">
        <Smile
          className="cursor-pointer"
          onClick={() => setShowEmoji(!showEmoji)}
        />
        <CameraIcon
          className="cursor-pointer"
          onClick={() => imageInputRef.current.click()}
        />

        <input
          type="file"
          hidden
          ref={imageInputRef}
          onChange={(e) => setImage(e.target.files[0])}
        />

        {showEmoji && (
          <EmojiPicker
            onEmojiClick={(e) =>
              setNewMessage((prev) => prev + e.emoji)
            }
          />
        )}

        <input
          value={newMessage}
          onChange={(e) =>{ setNewMessage(e.target.value); handleTyping() }}
          className="flex-1 border p-2 rounded"
          placeholder={editingMessage ? "Edit message..." : "Type message..."}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <MousePointer2
          className="cursor-pointer text-blue-600"
          onClick={sendMessage}
        />
      </div>
    </div>
   
  );
};

export default MessageArea;
