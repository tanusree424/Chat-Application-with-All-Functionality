import { useEffect, useState } from "react";
import userImg from "../assets/user.png";
import toast from "react-hot-toast";
import { Api } from "../Api/Api";
import notificationTone from  "../assets/notification.mp3";
const ProfileModalEdit = ({ user, profile, closeModal }) => {
  const [animate, setAnimate] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const notificationSound  = new Audio(notificationTone);
  notificationSound.volume = 1;

  const [avatarPreview, setAvatarPreview] = useState(
    profile?.avatar
      ? `http://localhost:8000/storage/${profile.avatar}`
      : userImg
  );

  const [coverPreview, setCoverPreview] = useState(
    profile?.cover_photo
      ? `http://localhost:8000/storage/${profile.cover_photo}`
      : null
  );

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(closeModal, 300);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ name, bio, avatar, cover });
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    if (avatar) formData.append("avatar", avatar);
    if (cover) formData.append("cover_photo", cover);
    // API call to update profile can be made here
    handleClose();
    try {
      const response = await Api.post("/api/update-profile", formData, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile updated successfully!");
      notificationSound.play().catch((error) => {
        console.log("Error playing sound:", error);
      });
      console.log(response.data);
      // Optionally update user/profile state here
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-[400px] rounded-lg p-5 transform transition-all duration-300
        ${animate ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <button onClick={handleClose}>✕</button>
        </div>

        {/* Cover + Avatar */}
        <div
          className="relative h-40 rounded-lg mb-14 flex justify-center items-end"
          style={{
            backgroundImage: coverPreview ? `url(${coverPreview})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: coverPreview ? "transparent" : "#e5e7eb",
          }}
        >
          <img
            src={avatarPreview}
            className="w-24 h-24 rounded-full shadow-2xl object-cover border-4 border-white absolute -bottom-12"
            alt="avatar"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full border p-2 mb-3 rounded"
          />

          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="w-full border p-2 mb-3 rounded"
          />

          <label className="block text-sm mb-1">Profile Image</label>
          <input
            type="file"
            onChange={handleAvatarChange}
            className="w-full mb-3"
          />

          <label className="block text-sm mb-1">Cover Photo</label>
          <input
            type="file"
            onChange={handleCoverChange}
            className="w-full mb-4"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModalEdit;
