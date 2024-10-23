import axios from 'axios';
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function UploadTripModal({openModel,setOpenModel,fetchTrips}) {
  const [file, setFile] = useState(null);
  const [tripName, setTripName] = useState('');

  let token = localStorage.getItem("token")
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tripName", tripName);    
  
    try {
      let res = await axios.post("/createtrips", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Check if the response indicates success
      if (res.status === 200) { // Adjust the status code based on your server response
        setOpenModel(false); // Close the modal after upload
        fetchTrips()
        alert("Uploaded success ");

          } else {
        alert("Upload failed: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Upload failed: " + (err.response ? err.response.data.message : err.message));
    }
  };
  

  return (
    <>
      

      <Modal show={openModel} onHide={() => setOpenModel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Trip Name input */}
            <Form.Group controlId="tripName" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Trip Name*"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                required
              />
            </Form.Group>

            {/* Custom styled file input */}
            <Form.Group controlId="formFile" className="mb-3">
              <div className="custom-file-upload">
                <input
                  type="file"
                  id="fileUpload"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="fileUpload">
                  <i className="upload-icon">⬆️</i>
                  Click here to upload the <strong>Excel</strong> sheet of your trip
                </label>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setOpenModel(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || !tripName} // Disable if no file or trip name is provided
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UploadTripModal;
