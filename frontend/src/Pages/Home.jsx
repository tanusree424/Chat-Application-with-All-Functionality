import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import MessageArea from "./MessageArea";
import echo from "../lib/Echo";
import { Api } from "../Api/Api";
import { LogOutIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import userImg from "../assets/user.png";
import notificationTone from "../assets/MessageNotification.mp3";
import ProfileModalEdit from "./ProfileModalEdit";

const Home = () => {
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [OnlineUsers, setOnlineUsers] = useState([]);
  const [Messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const authUser = JSON.parse(localStorage.getItem("user"));
  const notificationSoundRef = useRef(null);

  const [Profile, setProfile] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [SelectedUserProfile, setSelectedUserProfile] = useState(null);
      const [lastSeen, setLastSeen] = useState({});
      
        const [userTypingId, setUserTypingId] = useState(null);
          const typingTimeout = useRef(null);

  /* 🔔 notification sound setup */
  useEffect(() => {
    notificationSoundRef.current = new Audio(notificationTone);
    notificationSoundRef.current.volume = 1;
  }, []);

  /* 🔓 unlock audio */
  useEffect(() => {
    const unlockAudio = () => {
      notificationSoundRef.current?.play().catch(() => {});
      notificationSoundRef.current?.pause();
      notificationSoundRef.current.currentTime = 0;
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  /* 📩 load messages */
  const getMessage = async () => {
    if (!selectedUsers?.id) return;

    const res = await Api.get(`/api/messages/${selectedUsers.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setMessages(res.data);
  };

  /* 👤 auth profile */
  useEffect(() => {
    Api.get("/api/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => setProfile(res.data.user?.profile));
  }, []);

  /* 🟢 online users */
 useEffect(() => {
  echo.join("online-users")
    .here((users) => {
      setOnlineUsers(users.map(u => u.id));
    })
    .joining((user) => {
      setOnlineUsers(prev => [...prev, user.id]);
    })
    .leaving((user) => {
      const time = new Date();
       console.log("🔴 User left:", user.id);
      console.log("⏰ Last seen:", time.toLocaleTimeString());
      setOnlineUsers(prev => prev.filter(id => id !== user.id));

      setLastSeen(prev => ({
        ...prev,
        [user.id]: time
      }));
      console.log(lastSeen)
    });

  return () => {
    echo.leave("online-users");
  };
}, []);


  /* 🔔 notification event */
  useEffect(() => {
    if (!authUser?.id) return;

    const channel = echo.private(
      `message.notifications.${authUser.id}`
    );

    channel.listen("MessageNotificationSentEvent", (e) => {
      console.log(e.message);
      notificationSoundRef.current?.play().catch(() => {});

      toast.success(`New message from ${e.message.sender_name}`);

      if (selectedUsers?.id === e.message.sender_id) {
        setMessages((prev)=>
        prev.map((m)=>
        m.id === e.message.id ?
        {...m , markAsRead:1} : m
        )
        );
         Api.post(
        "/api/mark-messages-seen",
        { sender_id: m.sender_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
        getMessage();

      }
    });

    return () => echo.leave(`message.notifications.${authUser.id}`);
  }, [authUser?.id, selectedUsers?.id]);

  /* 💬 message sent + seen (SINGLE EFFECT) */
  useEffect(() => {
    if (!authUser?.id) return;

    const channelName = `message.seen.${authUser.id}`;
    const channel = echo.private(channelName);

    // 📩 new message
   channel.listen("MessageSeenEvent", (e) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === e.message.id
          ? { ...msg, markAsRead: 1 }
          : msg
      )
    );
  });

    // ✅ seen update
    channel.listen("MessageSeenEvent", (e) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === e.message.id
            ? { ...msg, markAsRead: 1 }
            : msg
        )
      );
    });

    return () => echo.leave(channelName);
  }, [authUser?.id, selectedUsers?.id]);

  /* 👆 select user */
  const handleSelectUser = async (user) => {
    setSelectedUsers(user);

    await Api.post(
      "/api/mark-messages-seen",
      { sender_id: user.id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender_id === user.id &&
        msg.receiver_id === authUser.id
          ? { ...msg, markAsRead: 1 }
          : msg
      )
    );
  };
const logout = async () => {
  try {
    await Api.get("/api/logout", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Laravel কে 300ms দাও offline broadcast করার জন্য
    setTimeout(() => {
      window.location.href = "/";
    }, 300);

  } catch (error) {
    console.log("Logout error:", error);
  }
};
  /* ===================== TYPING LISTENER ===================== */
  useEffect(() => {
    if (!authUser?.id) return;

    const channel = echo.private(`typing.${authUser.id}`);

    channel.listen("UserTyping", (e) => {
      console.log("🔥 UserTyping:", e);

      if (e.sender_id === selectedUsers?.id) {
        setUserTypingId(e.sender_id);

        setTimeout(() => {
          setUserTypingId(null);
        }, 1500);
      }
    });

    return () => {
      channel.stopListening("UserTyping");
      echo.leave(`private-typing.${authUser.id}`);
    };
  }, [authUser?.id, selectedUsers?.id]);
/* ===================== HANDLE TYPING (DEBOUNCED) ===================== */
  const handleTyping = () => {
    if (!selectedUsers?.id) return;
    if (typingTimeout.current) return;

    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 1200);

    Api.post(
      "/api/typing",
      { receiver_id: selectedUsers.id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  };

  return (
    <div className="flex">
      <div className="w-120 bg-pink-500 min-h-screen">
        <div className="bg-blue-500 p-4 flex gap-2">
          <img
            src={
              Profile?.avatar
                ? `http://localhost:8000/storage/${Profile.avatar}`
                : userImg
            }
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setOpenProfileModal(true)}
          />
          <p className="text-white text-xl">
            Welcome, {authUser?.name}
            <LogOutIcon onClick={logout} className="inline ml-2 cursor-pointer" />
          </p>
        </div>

        <Sidebar
          setSelectedUsers={setSelectedUsers}
          users={users}
          setUsers={setUsers}
          handleSelectUser={handleSelectUser}
          selectedUsers={selectedUsers}
          OnlineUsers={OnlineUsers}
          SelectedUserProfile={SelectedUserProfile}
          setSelectedUserProfile={setSelectedUserProfile}
        />
      </div>

     <div className="w-full">
  {selectedUsers ? (
    <MessageArea
      Messages={Messages}
      userTypingId={userTypingId}
      lastSeen={lastSeen}
      OnlineUsers={OnlineUsers}
      setMessages={setMessages}
      handleTyping={handleTyping}
      setSelectedUsers={setSelectedUsers}
      selectedUsers={selectedUsers}
      typingTimeout={typingTimeout}
      openProfileModal={openProfileModal}
     setSelectedUserProfile={setSelectedUserProfile}
      getMessage={getMessage}
    />
  ) : (
    <div className="h-full flex items-center text-blue-300 justify-center text-xl">
      Select a user to start a chat
    </div>
  )}
</div>


      {openProfileModal && (
        <ProfileModalEdit
          profile={Profile}
          setProfile={setProfile}
          closeModal={() => setOpenProfileModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
