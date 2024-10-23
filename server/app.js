const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config');
const tripRoutes = require('./routes/tripRoutes');
const cors = require('cors'); // Import cors


dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use(cors()); // This will enable CORS for all requests

app.use('/api', tripRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
