// src/pages/Banners.jsx
import React, { useState } from "react";
import { FiUpload, FiTrash2, FiEye, FiX } from "react-icons/fi";

const Banners = () => {
  const [banners, setBanners] = useState([
    {
      id: 1,
      title: "Festive Offer 🎉",
      image: "/images/banner1.jpg",
      active: true,
    },
    {
      id: 2,
      title: "Healthy Living Campaign 🍃",
      image: "/images/banner2.jpg",
      active: false,
    },
  ]);

  const [selectedBanner, setSelectedBanner] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      const newBannerObj = {
        id: Date.now(),
        title: file.name,
        image: imageURL,
        active: false,
      };
      setBanners([...banners, newBannerObj]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setBanners(banners.filter((b) => b.id !== id));
    }
  };

  const toggleActive = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#5C3A21] text-center sm:text-left">
          Banners Management
        </h2>

        <label className="flex items-center justify-center gap-2 bg-[#5C3A21] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#7A4B2F] transition-all w-full sm:w-auto">
          <FiUpload /> Upload New
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all"
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-44 sm:h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-4">
              <h3 className="font-semibold text-[#5C3A21] mb-2 truncate">
                {banner.title}
              </h3>
              <div className="flex flex-wrap justify-between items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    banner.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {banner.active ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-3 text-lg">
                  <button
                    onClick={() => setSelectedBanner(banner)}
                    className="hover:text-blue-500"
                    title="Preview"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => toggleActive(banner.id)}
                    className="hover:text-amber-500"
                    title="Toggle Active"
                  >
                    ⚡
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="hover:text-red-500"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Preview Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setSelectedBanner(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <FiX size={22} />
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-[#5C3A21] mb-3 text-center">
              {selectedBanner.title}
            </h3>
            <img
              src={selectedBanner.image}
              alt={selectedBanner.title}
              className="rounded-lg w-full h-56 sm:h-64 object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
