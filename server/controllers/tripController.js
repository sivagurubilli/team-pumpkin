const fs = require('fs');
const Trip = require('../models/Trip'); // Assuming you have the Trip model set up
const csvParser = require('csv-parser');
const streamifier = require('streamifier');
const geolib = require('geolib');


// Define speed thresholds
const SPEED_THRESHOLD = 60; // km/h for overspeeding

// Process trip data by calculating distance, stoppage, idling, overspeeding, and traveling durations
const processTripData = (coordinates, tripName) => {
  let totalDistance = 0;
  let stoppageDuration = 0;    // in minutes
  let idlingDuration = 0;      // in minutes
  let overspeedingDuration = 0; // in minutes
  let totalTravelledDuration = 0; // in minutes

  let prevCoordinate = null;
  const parsedCoordinates = [];

  coordinates.forEach((coord, index) => {
    if (prevCoordinate) {
      // Parse the timestamp to Date objects
      const currentTimestamp = new Date(coord.timestamp.replace(' ', 'T')); // Standardizing timestamp format for Date
      const prevTimestamp = new Date(prevCoordinate.timestamp.replace(' ', 'T'));

      // Calculate the distance between the current and previous coordinates
      const distance = geolib.getDistance(
        { latitude: prevCoordinate.latitude, longitude: prevCoordinate.longitude },
        { latitude: coord.latitude, longitude: coord.longitude }
      );
      totalDistance += distance;

      // Calculate the time difference in minutes
      const timeDifference = (currentTimestamp - prevTimestamp) / (1000 * 60); // in minutes
      // Calculate speed (distance / time)
      const speed = timeDifference > 0 ? (distance / 1000) / (timeDifference / 60) : 0; // in km/h
      coord.speed = speed; // Attach speed to current coordinate

      // State Handling
      if (coord.ignition === 'off') {
        coord.state = 'stopped';
        stoppageDuration += timeDifference; // Accumulate stoppage time
      } else if (speed === 0) {
        coord.state = 'idle';
        idlingDuration += timeDifference; // Accumulate idling time
      } else if (speed > SPEED_THRESHOLD) {
        coord.state = 'overspeeding';
        overspeedingDuration += timeDifference; // Accumulate overspeeding time
      } else {
        coord.state = 'moving';
        totalTravelledDuration += timeDifference; // Accumulate moving time
      }
    } else {
      // Set speed and state for the first coordinate since we don't have a previous point to compare
      coord.speed = 0;
      coord.state = 'stopped';
    }

    // Add the coordinate to the parsedCoordinates array
    parsedCoordinates.push(coord);

    // Set the current coordinate as the previous one for the next iteration
    prevCoordinate = coord;
  });

  // Return processed trip data
  return {
    tripName,
    totalDistance: totalDistance / 1000, // Convert meters to kilometers
    stoppageDuration,                    // Total stoppage in minutes
    idlingDuration,                      // Total idling in minutes
    overspeedingDuration,                // Total overspeeding in minutes
    totalTravelledDuration,              // Total travelled time in minutes
    startTime: coordinates[0].timestamp,
    endTime: coordinates[coordinates.length - 1].timestamp,
    coordinates: parsedCoordinates,      // Parsed coordinates with speed and state data
  };
};




const createTrip = async (req, res) => {
  try {
    const { tripName } = req.body;
    const file = req.file;
    if (!tripName || !file) {
      return res.status(400).json({ success: false, message: 'Trip name and file are required' });
    }

    const coordinates = [];

    // Convert file.buffer to a stream using streamifier
    const parseCsv = new Promise((resolve, reject) => {
      streamifier.createReadStream(file.buffer)
        .pipe(csvParser({ headers: ['latitude', 'longitude', 'timestamp', 'ignition'], skip_empty_lines: true }))
        .on('data', (row) => {
          const lat = parseFloat(row.latitude);
          const lon = parseFloat(row.longitude);

          // Check if the row is valid and ensure headers are not processed as data
          if (!isNaN(lat) && !isNaN(lon) && lat !== 'latitude' && lon !== 'longitude') {
            coordinates.push({
              latitude: lat,
              longitude: lon,
              timestamp: row.timestamp,
              ignition: row.ignition,
            });
          }
        })
        .on('end', () => resolve(coordinates))
        .on('error', (error) => reject(error));
    });

    const parsedCoordinates = await parseCsv;

    // Process the trip data
    const tripData = await processTripData(parsedCoordinates, tripName);

    // Save the processed trip data to the database
    const newTrip = new Trip({
      tripName,
      totalDistance: tripData.totalDistance,
      stoppageDuration: tripData.stoppageDuration,
      idlingDuration: tripData.idlingDuration,
      overspeedingDuration: tripData.overspeedingDuration,
      totalTravelledDuration: tripData.totalTravelledDuration,
      startTime: tripData.startTime,
      endTime: tripData.endTime,
      coordinates: tripData.coordinates,// Store all the coordinates
    });
    
    await newTrip.save(); // Save the trip data to the database

    // Respond with the processed and saved trip data
    res.status(200).json({ success: true, trip: newTrip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

    


// Get trips for a user
const getTrips = async (req, res) => {
    try {
      const {  id } = Object.assign(req.body, req.query, req.params)
      const userId = req.user._id; // Access the userId from the token

      // Check if a id is provided
      if (id) {
        // Fetch single trip details by id and userId
        const trip = await Trip.findOne({ _id: id,userId });
        if (!trip) {
          return res.status(404).json({ success: false, message: 'Trip not found' });
        }
        return res.json({ success: true, trip });
      }
  
      // If no id, fetch all trips associated with the userId
      const trips = await Trip.find({userId });
      res.json({ success: true, trips });
      
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  // Delete a trip by id
const deleteTrip = async (req, res) => {
  try {
    const { id } = Object.assign(req.body, req.query, req.params);
    const userId = req.user._id; // Access the userId from the token

    // Check if a trip ID is provided
    if (!id) {
      return res.status(400).json({ success: false, message: 'Trip ID is required' });
    }

    // Find the trip by id and ensure it belongs to the logged-in user
    const trip = await Trip.findOneAndDelete({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or not authorized' });
    }

    // Trip was successfully deleted
    res.json({ success: true, message: 'Trip successfully deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

  

module.exports = { createTrip, getTrips ,deleteTrip};
