const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  tripName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if needed
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }, // Optional if needed
  totalDistance: { type: Number }, // in kilometers
  stoppageDuration: { type: Number }, // in minutes
  idlingDuration: { type: Number }, // in minutes
  startTime: { type: Date },
  endTime: { type: Date },
  coordinates: [
    {
      latitude: { type: Number },
      longitude: { type: Number },
      ignition: { type: String },
      timestamp: { type: String }
    }
  ],
}, { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
