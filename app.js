const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Initialize Express app
const app = express();

// Configure dotenv to load environment variables
dotenv.config({
  path: path.resolve(__dirname, '.env') // Ensure path is correct
});

// Get MongoDB URI from environment variables
const mongoURI = process.env.MONGODB_URI;

// Check if MongoDB URI is provided
if (!mongoURI) {
  console.error('MONGODB_URI environment variable is not defined');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  ssl: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
});

// Define location schema and model
const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  timestamp: { 
    type: Date, 
    default: () => {
      // Get current Indian Standard Time
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5.5
      const istTime = new Date(now.getTime() + istOffset);
      return istTime;
    }
  }
});

const Location = mongoose.model('Location', locationSchema);

// Set view engine and views directory
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware to parse JSON
app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define route for the homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Define route to handle location data
app.post('/location', async (req, res) => {
  const { latitude, longitude } = req.body;
  console.log(`Received location: Latitude - ${latitude}, Longitude - ${longitude}`);

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).send('Invalid location data');
  }

  const location = new Location({ latitude, longitude });
  try {
    await location.save();
    res.send('Location received and saved');
  } catch (err) {
    console.error('Error saving location', err);
    res.status(500).send('Internal server error');
  }
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
