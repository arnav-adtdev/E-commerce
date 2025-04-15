require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./db/dbconnect'); // Ensure this file exists and connects to MongoDB
const User = require('./models/schema'); // Ensure the schema is correctly implemented
const twilio = require('twilio');

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();

// Connect to the database
connectDB();

// Middleware setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
    origin: "http://localhost:3001", // Frontend URL
    methods: ["GET", "POST"], // Allowed HTTP methods
}));


// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "E-COM WEBSITE" });
});

app.get('/cart', (req, res) => {
  res.render("pages/cart");
});

app.get('/checkout', (req, res) => {
  res.render("pages/checkout");
});

app.get("/men", (req, res) => {
  res.render("pages/men");
});

// Send OTP Endpoint
app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  // Validate E.164 phone number format
  if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  req.session.otp = otp;
  req.session.otpExpiry = Date.now() + 300000; // OTP expires in 5 minutes

  try {
      const message = await client.messages.create({
          body: `Your OTP is ${otp}`,
          to: phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,
      });
      console.log(`Sent OTP ${otp} to ${phoneNumber}, SID: ${message.sid}`);
      res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
      console.error("Error sending OTP:", error.response?.data || error.message);
      res.status(500).json({ success: false, message: "Failed to send OTP. Please try again later." });
  }
});



// Save User Endpoint
app.post('/save-user', async (req, res) => {
  const { firstName, lastName, email, mobile, otp } = req.body;

  // Input validation
  if (!firstName || !lastName || !email || !mobile || !otp) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (req.session.otp !== otp || Date.now() > req.session.otpExpiry) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  try {
    const newUser = new User({ firstName, lastName, email, mobile });
    await newUser.save();
    res.status(201).json({ success: true, message: "User saved successfully", user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: "Duplicate entry detected." });
    } else {
      console.error("Error saving user:", error);
      res.status(500).json({ success: false, message: "An internal error occurred." });
    }
  }
});

// Check User Endpoint
app.post("/check-user", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, message: "Mobile number is required." });
  }

  try {
    const userExists = await User.exists({ mobile });
    res.status(200).json({ success: true, exists: !!userExists });
  } catch (error) {
    console.error("Error in /check-user:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred." });
  }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
