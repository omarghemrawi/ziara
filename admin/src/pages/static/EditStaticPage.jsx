import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadImageToCloudinary } from "../../utils/cloudinaryUpload";
import { toast } from "react-toastify";
import "./EditStaticPage.css";
import axios from "axios";
const API_URL1 = import.meta.env.VITE_API_URL;

const EditStaticPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = `${API_URL1}/api/static`;
  const token = localStorage.getItem("adminToken")

  const [form, setForm] = useState({
    name: "",
    type: "religious",
    description: "",
    profile: "",
    rate: 0,
    city: "",
    location: "",
    referenceImages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Generic input change handler
  const handleChange = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: field === "rate" ? parseFloat(e.target.value) : e.target.value,
    }));

  // Fetch place data
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setInitialLoading(true);
        const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }});
        const data = res.data;

        if (data.success) {
          const p = data.data;
          setForm({
            name: p.name || "",
            type: p.type || "religious",
            description: p.description || "",
            profile: p.profile || "",
            rate: p.rate || 0,
            city: p.city || "",
            location: p.location || "",
            referenceImages: p.referenceImages || [],
          });
        } else {
          setError("Failed to fetch place data");
        }
      } catch (err) {
        console.error(err);
        setError("Network error. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchPlace();
  }, [id]);

  // Upload profile image
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, profile: url }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile image");
    }
  };

  // Add reference image
  const handleReferenceImageAdd = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({
        ...prev,
        referenceImages: [...prev.referenceImages, url].slice(0, 15),
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload reference image");
    }
  };

  const handleReferenceImageDelete = (index) => {
    setForm((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.profile || !form.city || !form.location) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.put(`${API_URL}/${id}`, {
        ...form,
        rate: parseFloat(form.rate),
      }, {
            headers: { Authorization: `Bearer ${token}` },});

      if (data.success) {
              toast.success("Place updated successfully!");
        navigate("/staticPlace", { replace: true });
      } else {
        setError(data.message || "Failed to update place");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return (
      <div className="add-static-place-container">
        <h2>Edit Place</h2>
        <p>Loading place data...</p>
      </div>
    );

  return (
    <div className="add-static-place-container">
      <h2>Edit Place</h2>

      {error && <div className="error-message">{error}</div>}

      <form className="add-static-place-form" onSubmit={handleSubmit}>
  <p className="input-helper">Enter the official name of the place.</p>
  <input
    type="text"
    placeholder="Place Name *"
    value={form.name}
    onChange={handleChange("name")}
    required
  />

  <p className="input-helper">Choose the type of place.</p>
  <select value={form.type} onChange={handleChange("type")} required>
    <option value="religious">Religious</option>
    <option value="touristic">Touristic</option>
  </select>

  <p className="input-helper">Enter the city where the place is located.</p>
  <input
    type="text"
    placeholder="City *"
    value={form.city}
    onChange={handleChange("city")}
    required
  />

  <p className="input-helper">Enter the detailed location or address.</p>
  <input
    type="text"
    placeholder="Location *"
    value={form.location}
    onChange={handleChange("location")}
    required
  />

  <p className="input-helper">Provide a short description of the place.</p>
  <textarea
    placeholder="Description *"
    value={form.description}
    onChange={handleChange("description")}
    required
  />

  <p className="input-helper">Upload a main image representing the place.</p>
  {form.profile && <img src={form.profile} alt="Profile" className="profile-preview" />}
  <input type="file" accept="image/*" onChange={handleProfileImageChange} required={!form.profile} />

  <p className="input-helper">Enter the average rating (0–5) for the place.</p>
  <input
    type="number"
    placeholder="Rating (0-5)"
    value={form.rate}
    onChange={handleChange("rate")}
    min="0"
    max="5"
    step="0.1"
  />

  <p className="input-helper">Upload additional images (up to 15) to show details.</p>
  <div className="reference-images-container">
    {form.referenceImages.map((img, i) => (
      <div key={i} className="reference-image-wrapper">
        <img src={img} alt={`ref-${i}`} className="reference-image" />
        <button
          type="button"
          onClick={() => handleReferenceImageDelete(i)}
          className="delete-btn"
          aria-label="Delete reference image"
        >
          ×
        </button>
      </div>
    ))}
    {form.referenceImages.length < 15 && (
      <input
        type="file"
        accept="image/*"
        onChange={handleReferenceImageAdd}
        className="reference-image-input"
        title="Add Reference Image"
      />
    )}
  </div>

  <div className="form-actions">
    <button
      type="button"
      onClick={() => navigate("/staticPlace", { replace: true })}
      className="cancel-btn"
    >
      Cancel
    </button>
    <button type="submit" disabled={loading}>
      {loading ? "Updating..." : "Update Place"}
    </button>
  </div>
</form>


    </div>
  );
};

export default EditStaticPage;
