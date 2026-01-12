import React, { useState, useEffect } from "react";
import { Api } from "../Api/Api";
import userImg from "../assets/user.png";
import ProfileModal from "./ProfileModel";
import echo from "../lib/Echo";

const Sidebar = ({
  setSelectedUsers,
  SelectedUserProfile,
  users,
  setUsers,
  SelectedUsers,
  handleSelectUser,
  OnlineUsers,
  setSelectedUserProfile,
}) => {

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);


  /* 🔹 fetch users */
  const fetchUser = async () => {
    try {
      const res = await Api.get("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data.profile ?? res.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
const authUser = JSON.parse(localStorage.getItem("user"));
  /* 🔹 realtime unread count */
  useEffect(() => {
    
    if (!authUser?.id) return;

    const channel = `chat.${authUser.id}`;

    echo.private(channel).listen("MessageSent", (e) => {
      
      setUsers((prev) =>
        prev.map((u) =>
          u.id === e.message.sender_id
            ? {
                ...u,
                last_message: e.message.message,
                unread_count: (u.unread_count || 0) + 1,
              }
            : u
        )
      );
    //  console.log("Unread count updated for user ID:", e.message.sender_id);
    });

    return () => {
      echo.leave(`private-${channel}`);
    };
  }, []);

  /* 🔹 search */
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResult([]);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await Api.get(`/api/search-users?q=${search}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSearchResult(res.data);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);
  
 

  const displayUsers =
    search.trim().length >= 2 ? searchResult : users;

  /* 🔹 user click */
 
  return (
    <>
      {/* 🔍 Search */}
      <div className="p-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user..."
          className="w-full p-2 rounded"
        />
      </div>

      {/* 👥 User List */}
      <ul>
        {displayUsers.map((user) => {
          const isSelected = SelectedUsers?.id === user.id;
          const isOnline = OnlineUsers.includes(user.id);

          return (
            <li
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`flex gap-2 p-2 cursor-pointer text-white
                ${isSelected ? "bg-pink-400" : "hover:bg-pink-400"}
              `}
            >
              {isOnline && (
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
              )}

              <img
                src={
                  user.profile
                    ? `http://localhost:8000/storage/${user.profile.avatar}`
                    : userImg
                }
                className="w-12 h-12 rounded-full object-cover"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUserProfile(user);
                }}
              />

              <div className="flex flex-col">
                <span className="mt-3">{user.name}</span>

                {user.unread_count > 0 && (
                  <small className="text-xs text-yellow-200">
                    {user.unread_count} unread
                  </small>
                )}

                {user.last_message && (
                  <small className="text-xs truncate w-40">
                    {user.last_message}
                  </small>
                )}
              </div>
            </li>
          );
        })}
      </ul> 
      {
     SelectedUserProfile && (
        <ProfileModal
          user={SelectedUserProfile}
          closeModal={() => setSelectedUserProfile(null)}
        />
      )
    }  
    </>
    
  );

};

export default Sidebar;
