import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/Gallery.css";

export default function Gallery() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await API.get("/files/gallery");
      setFiles(data);
    };
    fetchFiles();
  }, []);

  return (
    <div className="gallery-container">
      <h2>Your Uploaded Documents</h2>
      <div className="gallery-grid">
        {files.map((file) => (
          <div key={file._id} className="gallery-item">
            <h3>{file.filename}</h3>
            <div className="gallery-images">
              <img
                src={`http://localhost:5000${file.originalUrl}`}
                alt="original"
              />
              <img
                src={`http://localhost:5000${file.processedUrl}`}
                alt="processed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
