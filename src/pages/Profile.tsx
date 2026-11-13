import { useAppContext } from "../context/AppContext";

const Profile = () => {
  const { user, logout } = useAppContext();

  if (!user) return null;

  return (
    <main className="page profile-page">
      <div className="profile-card">
        <h2>Profil Saya</h2>

        <div className="profile-head">
          <div className="avatar" />
          <div className="profile-id">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
          <button className="primary-button profile-edit" onClick={() => void logout()}>
            Keluar
          </button>
        </div>

        <div className="profile-fields">
          <label>
            Nama Lengkap
            <input value={user.name} readOnly />
          </label>
          <label>
            Username
            <input value={user.username} readOnly />
          </label>
          <label>
            Email
            <input type="email" value={user.email} readOnly />
          </label>
        </div>
      </div>
    </main>
  );
};

export default Profile;