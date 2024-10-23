import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
import axios from "axios";
import UploadTripModal from "../utils/UploadModel";
import { useNavigate } from "react-router-dom";

const TripList = ({ token }) => {
  const [trips, setTrips] = useState([]);
  const [file, setFile] = useState(null);
  const [openModel, setOpenModel] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null); // Hold single trip
const navigate = useNavigate()


  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get("/trips", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data);
    } catch (err) {
      alert("Error fetching trips");
    }
  };



  const handleSelectTrip = (tripId) => {
    setSelectedTrip(tripId === selectedTrip ? null : tripId); // Deselect if the same trip is clicked
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete the selected trip?")) {
      try {
        await axios.delete(`/deletetrips/${selectedTrip}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTrips();
        setSelectedTrip(null); // Clear selection after deletion
      } catch (err) {
        alert("Error deleting trip");
      }
    }
  };

  const handleOpen = () => {
    // Implement open logic here (e.g., navigate to trip details)
 navigate(`/trip-details/${selectedTrip}`)
  };

  return (
    <>
    <UploadTripModal
openModel={openModel}
setOpenModel ={setOpenModel}
fetchTrips={fetchTrips}
    />
      {/* Header with welcome and file upload */}
      <div
        style={{
          width: "80%",
          height: "auto",
          border: "1px solid grey",
          borderRadius: "20px",
          marginTop: "20px",
          marginLeft: "10%", // Corrected 'margi fornLeft' to 'marginLeft'
          display: "flex",
          alignItems: "center", // Vertically centers the content
          flexDirection: "row", // Default direction
          flexWrap: "wrap", // Allow wrapping on small screens
        }}
      >
        <div
          onClick={() => setOpenModel(true)}
          className="p-3 d-flex align-items-center"
        >
          <Button style={{ backgroundColor: "grey" }}>Upload Trip</Button>
        </div>
        <div className="p-2">
          <h3
            style={{
              fontSize: ".8rem", // Font size similar to h4 (1.25rem is equivalent to 20px)
              fontWeight: "bold",
            }}
          >
            Upload Excel Sheet of your trip
          </h3>
        </div>
      </div>

      {/* Trips Table */}
      <Row
        style={{
          width: "80%",
          border: "1px solid grey",
          borderRadius: "20px",
          marginTop: "20px",
          marginLeft: "10%",
          padding: "30px",
        }}
      >
        <Row>
          <Col
            xs={12}
            className="mx-auto d-flex justify-content-between align-items-center"
          >
            <h5 className="mb-3 text-center">Your Trips</h5>
            <div className="mb-2 d-flex justify-content-center d-none d-sm-flex">
              <Button
                variant="danger"
                className="ms-2"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="primary"
                onClick={handleOpen}
                className="ms-2" // Adds space between buttons
              >
                Open
              </Button>
            </div>
          </Col>
        </Row>

<Col md={4}>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>select</th>
              <th>Trips</th>
            </tr>
          </thead>
          <tbody>
            {trips?.trips?.map((trip, index) => (
              <tr key={trip.id}>
                <td>
                <input
                      type="radio"
                      checked={selectedTrip === trip._id}
                      onChange={() => handleSelectTrip(trip._id)}
                    />
                </td>
                <td>{trip?.tripName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </Col>

      </Row>


   

     


      
    </>
  );
};

export default TripList;
