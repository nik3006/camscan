import React, { useState, useRef, useEffect } from "react";
import API from "../services/api";
import "../styles/Upload.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [beforeUrl, setBeforeUrl] = useState(null);
  const [afterUrl, setAfterUrl] = useState(null);
  const [processedBlob, setProcessedBlob] = useState(null);
  const canvasRef = useRef(null);

  // ✅ Check if OpenCV.js is loaded
  useEffect(() => {
    const checkOpenCV = setInterval(() => {
      if (window.cv && window.cv.imread) {
        console.log("✅ OpenCV.js loaded successfully!");
        clearInterval(checkOpenCV);
      } else {
        console.log("⏳ Loading OpenCV...");
      }
    }, 500);
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setBeforeUrl(URL.createObjectURL(selectedFile));

    // Wait for OpenCV to load before processing
    if (window.cv && selectedFile) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(selectedFile);
      img.onload = () => processImage(img);
    } else {
      console.warn("⏳ Waiting for OpenCV to load...");
    }
  };

  // ✅ Process image with OpenCV.js before uploading
  const processImage = (img) => {
    const cv = window.cv;

    const src = cv.imread(img);
    const dst = new cv.Mat();
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const edges = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Reduce noise
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Detect edges
    cv.Canny(blurred, edges, 75, 200);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // Find largest contour (document edges)
    let maxContour = null;
    let maxArea = 0;
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      if (area > maxArea) {
        maxArea = area;
        maxContour = cnt;
      }
    }

    // Draw contour if found
    src.copyTo(dst);
    if (maxContour) {
      const color = new cv.Scalar(0, 255, 0, 255);
      cv.drawContours(dst, new cv.MatVector(maxContour), -1, color, 3);
    }

    // Show processed preview
    cv.imshow(canvasRef.current, dst);

    // Convert canvas to Blob for uploading
    canvasRef.current.toBlob((blob) => {
      setProcessedBlob(blob);
      setAfterUrl(URL.createObjectURL(blob));
    }, "image/jpeg");

    // Cleanup
    src.delete();
    dst.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
  };

  // ✅ Upload processed image instead of original
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!processedBlob) return alert("Please select an image first");

    const formData = new FormData();
    formData.append("processed", processedBlob, "processed-image.jpg");

    try {
      const { data } = await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setBeforeUrl(`http://localhost:5000${data.file.originalUrl}`);
      setAfterUrl(`http://localhost:5000${data.file.processedUrl}`);
      alert("✅ Processed image uploaded successfully!");
    } catch (error) {
      alert(error.response?.data?.msg || "Upload failed");
    }
  };

  return (
    <div className="upload-container">
      <h2>📄 Upload & Auto-Crop Documents</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload Processed Image</button>
      </form>

      {beforeUrl && (
        <div className="preview-section">
          <div>
            <h3>Before</h3>
            <img src={beforeUrl} alt="Original" />
          </div>
          <div>
            <h3>After</h3>
            <canvas ref={canvasRef}></canvas>
            {afterUrl && <img src={afterUrl} alt="Processed Preview" />}
          </div>
        </div>
      )}
    </div>
  );
}
