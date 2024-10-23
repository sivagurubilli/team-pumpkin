import React, { useState } from 'react';
import { Container, Form, Button, Image, Row, Col } from 'react-bootstrap';
import uploadIcon from "../assets/uploadmap.png";  // Replace with the correct path to your image
import UploadTripModal from '../utils/UploadModel';
import { useNavigate } from 'react-router-dom';

const UploadTrip = () => {

  const [openModel, setOpenModel] = useState(false);
const navigate = useNavigate()
 

  const fetchTrips =  () => {
   
      navigate("/trips")
   
  };

  return (
    <>
    <UploadTripModal
openModel={openModel}
setOpenModel ={setOpenModel}
fetchTrips={fetchTrips}


    />
        <div className="text-center" style={{
          width: "80%",
          height: "auto",
          border: "1px solid grey",
          borderRadius: "20px",
          marginTop: "20px",
          marginLeft: "10%", // Corrected 'margi fornLeft' to 'marginLeft'
        
          alignItems: "center", // Vertically centers the content
        
        }} >
          <div className="my-4" >
            {/* Upload Image Section */}
            <Image src={uploadIcon} alt="upload icon" fluid style={{ width: '150px', height: '150px' }} />
          </div>
          {/* Upload Button */}
          <Form>
            <Button variant="primary" className="mb-2"   onClick={() => setOpenModel(true)}>
              Upload Trip
            </Button>
            <p className="text-muted">Upload the Excel sheet of your trip</p>
          </Form>
        </div>
    </>
  );
};

export default UploadTrip;
