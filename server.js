require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./db/dbconnect');
const User = require('./models/schema')
const app = express();


// Connect to the database
connectDB();

// Middleware Setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Session Middleware (Stores OTP temporarily)

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true in production with HTTPS
}));

// Home Route
app.get("/", (req, res) => {
  res.render("index", { title: "E-COM WEBSITE" });
});

app.get('/views/pages/cart', (req, res) => {
  res.render('cart'); 
});

app.get("/views/component/men", (req, res) => {
  res.render("men");
});


// Send OTP Endpoint
app.post('/send-otp', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  // OTP generation logic
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;

  // Simulating sending OTP (In reality, integrate with an SMS API)
  console.log(`Sending OTP ${otp} to phone number ${phoneNumber}`);

  res.json({ success: true, message: 'OTP sent successfully' });
});

// Save User Data Endpoint
app.post('/save-user', async (req, res) => {
  const { firstName, lastName, email, mobile, otp } = req.body;

  // Debugging input
  console.log("Request body:", req.body);
  console.log("Stored OTP:", req.session?.otp);
  console.log("User-provided OTP:", otp);

  // Verify OTP
  if (!req.session || req.session.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  try {
    const newUser = new User({ firstName, lastName, email, mobile });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User saved successfully",
      user: newUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate entry detected" });
    }
    console.error("Error saving user:", error);
    res
      .status(500)
      .json({ success: false, message: "An internal error occurred" });
  }
});

// Check User Endpoint
const checkUserInDatabase = async (mobile) => {
  try {
      const user = await User.findOne({ mobile });
      return !!user; // Return true if user exists, false otherwise
  } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Error querying the database');
  }
};


app.post('/check-user', async (req, res) => {
  try {
      const { mobile } = req.body;

      if (!mobile) {
          return res.status(400).json({ message: 'Mobile number is required.' });
      }

      const userExists = await checkUserInDatabase(mobile);
      return res.status(200).json({ exists: userExists });
  } catch (error) {
      console.error('Error in /check-user:', error);
      return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
