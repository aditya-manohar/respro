import React, { useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

// Set the worker source globally for pdf.js
GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile && selectedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfData = new Uint8Array(event.target.result);
        const pdfDoc = await getDocument(pdfData).promise;
        let fullText = "";

        // Extract text content from each page
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          textContent.items.forEach((item) => {
            fullText += item.str + " ";
          });
        }

        // After extracting the text, attempt to extract the details
        extractDetails(fullText);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Function to extract details from the text
  const extractDetails = (text) => {
    const nameMatch = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/);  // Match first and last name (e.g., John Doe)
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);  // Match phone number (e.g., (123) 456-7890)
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);  // Match email address

    // Update state with the extracted information
    setResumeData({
      name: nameMatch ? nameMatch[0] : "Name not found",
      phone: phoneMatch ? phoneMatch[0] : "Phone not found",
      email: emailMatch ? emailMatch[0] : "Email not found",
    });
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {file && <p>File selected: {file.name}</p>}

      <div>
        <h3>Extracted Information:</h3>
        <p><strong>Name:</strong> {resumeData?.name}</p>
        <p><strong>Phone:</strong> {resumeData?.phone}</p>
        <p><strong>Email:</strong> {resumeData?.email}</p>
      </div>
    </div>
  );
}

export default ResumeUpload;
