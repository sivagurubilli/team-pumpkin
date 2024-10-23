import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { Container, Row, Col, Table, Badge, Spinner, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TripDetails = ({ token }) => {
  const [trip, setTrip] = useState(null);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const res = await axios.get(`/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coordinatesWithState = res.data.trip.coordinates.map((coord, index, arr) => {
        let state = 'normal'; // Default state
        let stoppedDuration = 0;
        let idleDuration = 0;

        // Check the speed and determine the state
        if (coord.speed === 0) {
          state = 'stopped';
        } else if (coord.speed < 20) { // Consider 20 KM/H as idle speed
          state = 'idle';
        } else if (coord.speed > 80) { // Consider 80 KM/H as overspeeding
          state = 'overspeeding';
        }

        // Add durations for stopped or idle states
        if (index > 0) {
          const prevCoord = arr[index - 1];
          const timeDiff = (new Date(coord.timestamp) - new Date(prevCoord.timestamp)) / 1000 / 60; // in minutes
          if (prevCoord.speed === 0) {
            stoppedDuration += timeDiff; // Accumulate stopped duration
          } else if (prevCoord.speed < 20) {
            idleDuration += timeDiff; // Accumulate idle duration
          }
        }

        return {
          ...coord,
          state,
          stoppedDuration,
          idleDuration,
        };
      });

      // Update the trip with the processed coordinates
      setTrip({ ...res.data.trip, coordinates: coordinatesWithState });

      const coordinatesPath = coordinatesWithState.map(coord => [
        coord.latitude, 
        coord.longitude
      ]);
      setPath(coordinatesPath);

    } catch (err) {
      setError('Error fetching trip details');
      console.error(err); // Log error for debugging
    } finally {
      setLoading(false);
    }
  };

  // Define colors for different states
  const getStateColor = (state) => {
    switch(state) {
      case 'stopped':
        return 'blue';  // Color for stopped state
      case 'idle':
        return 'pink';  // Color for idle state
      case 'overspeeding':
        return 'green';  // Color for overspeeding state
      default:
        return 'gray';  // Default color
    }
  };

  const renderCoordinateRows = () => {
    return trip.coordinates.map((coord, idx) => (
      <tr key={coord.timestamp || idx}>
        <td>{coord.timestamp}</td>
        <td>{coord.latitude}</td>
        <td>{coord.longitude}</td>
        <td>
          <Badge bg={coord.ignition === 'on' ? 'success' : 'danger'}>
            {coord.ignition.toUpperCase()}
          </Badge>
        </td>
        <td>{coord.speed ? `${coord.speed} KM/H` : 'N/A'}</td>
      </tr>
    ));
  };

  return (
    <Container className="mt-4">
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {trip && (
        <>
          <Row className="mb-3">
            <Col xs={12}>
              <h4>{trip.tripName}</h4>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={3} sm={6} className="mb-3">
              <Card className="p-3 text-center">
                <h5>Total Distance Travelled</h5>
                <p>{trip.totalDistance} KM</p>
              </Card>
            </Col>
            <Col lg={3} sm={6} className="mb-3">
              <Card className="p-3 text-center">
                <h5>Total Travelled Duration</h5>
                <p>{trip.travelDuration} Mins</p>
              </Card>
            </Col>
            <Col lg={3} sm={6} className="mb-3">
              <Card className="p-3 text-center">
                <h5>Over Speeding Duration</h5>
                <p>{trip.overspeedingDuration} Mins</p>
              </Card>
            </Col>
            <Col lg={3} sm={6} className="mb-3">
              <Card className="p-3 text-center">
                <h5>Stopped Duration</h5>
                <p>{trip.stoppageDuration} Mins</p>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <MapContainer
                center={path.length > 0 ? path[0] : [52.505, 13.336]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {path.length > 0 && <Polyline positions={path} color="blue" />}
                
                {/* Render Circle Markers */}
                {trip.coordinates.map((point, idx) => (
                  point.state && ( // Only render if the point has a state
                    <CircleMarker 
                      key={idx}
                      center={[point.latitude, point.longitude]}
                      radius={10} // Adjust size of the bubble
                      color={getStateColor(point.state)} // Dynamically set the color based on the state
                      fillOpacity={0.8}
                    >
                      <Popup>
                        {point.state === 'stopped' && `Stopped for ${point.stoppedDuration.toFixed(2)} mins`} <br />
                        {point.state === 'idle' && `Idle for ${point.idleDuration.toFixed(2)} mins`} <br />
                        {point.state === 'overspeeding' && `Overspeeding`}
                      </Popup>
                    </CircleMarker>
                  )
                ))}
              </MapContainer>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Ignition</th>
                    <th>Speed (KM/H)</th>
                  </tr>
                </thead>
                <tbody>
                  {renderCoordinateRows()}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default TripDetails;
