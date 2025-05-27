require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./db/dbconnect'); // Ensure this file exists and connects to MongoDB
const User = require('./models/schema'); // Ensure the schema is correctly implemented
const twilio = require('twilio');
const Order = require("./models/order"); // Adjust the path if needed
const router = express.Router();

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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

app.get('/payment', (req, res) => {
  res.render("pages/payment");
});

// Render the pages/header section
app.get("/men", (req, res) => {
  res.render("pages/header/men");
});

app.get("/women", (req, res) => {
  res.render("pages/header/women");
});

app.get("/kids", (req, res) => {
    res.render("pages/header/kids");
});

app.get("/kitchen", (req, res) => {
    res.render("pages/header/kitchen");
});

app.get("/appliance", (req, res) => {
    res.render("pages/header/appliance");
});

app.get("/food", (req, res) => {
    res.render("pages/header/food");
});

app.get("/householdcare", (req, res) => {
    res.render("pages/header/householdcare");
});

app.get("/travel", (req, res) => {
    res.render("pages/header/travel");
});

app.get("/personalcare", (req, res) => {
    res.render("pages/header/personalcare");
});


//component page render
app.get("/footer", (req, res) => {
  res.render("component/footer");
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

// Resend OTP Endpoint
app.post("/resend-otp", async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: "Phone number is required!" });
    }

    try {
        const newOtp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        console.log(`Generated OTP: ${newOtp} to: ${phoneNumber}`);

        // Send OTP via Twilio SMS
        await twilioClient.messages.create({
            body: `Your OTP is: ${newOtp}`,
            from: process.env.TWILIO_PHONE_NUMBER, // Replace with your Twilio phone number
            to: phoneNumber,
        });

        res.json({ success: true, message: "New OTP sent successfully!" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});


// Save User Endpoint
app.post('/save-user', async (req, res) => {
    const { firstName, lastName, email, mobile, otp } = req.body;

    if (!firstName || !lastName || !email || !mobile || !otp) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // ✅ Check if the provided OTP matches the latest one stored in the session
    if (!req.session.otp || req.session.otp !== otp || Date.now() > req.session.otpExpiry) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    try {
        const newUser = new User({ firstName, lastName, email, mobile });
        await newUser.save();

        req.session.userId = newUser._id; // Store user ID in session

        res.status(201).json({ success: true, message: "User saved successfully", userId: newUser._id });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ success: false, message: "An internal error occurred." });
    }
});


// get the user 
app.get('/get-user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "User not logged in." });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, userId: user._id });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});



app.get('/getOrders', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(400).json({ message: "User not logged in!" });
        }

        const orders = await Order.find({ user: req.session.userId }).sort({ date: -1 });

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found!" });
        }

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});


// Route to Save Order
app.post('/saveOrder', async (req, res) => {
    try {
        const { paymentId, items, totalAmount, paymentMethod, user } = req.body;

        if (!user || !paymentId) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newOrder = new Order({
            paymentId,
            user,
            items: items.length > 0 ? items : [], // ✅ Ensure items array is not null
            totalAmount,
            paymentMethod,
            status: "Pending",
            date: new Date()
        });

        await newOrder.save(); // ✅ Save to database

        console.log("Order saved successfully:", newOrder);
        res.status(201).json({ success: true, message: "Order placed!", order: newOrder });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


// ✅ Route to Fetch Orders for Logged-in User
router.get('/getOrders/:userId', async (req, res) => {
    try {
        const userId = req.params.userId?.trim(); // ✅ Trim userId to avoid spaces

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const orders = await Order.find({ user: userId });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found!" });
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


module.exports = router; // ✅ Export router for use in main app
// ✅ Route to Cancel an Order
app.post("/cancelOrder/:orderId", async (req, res) => {
    try {
        const order = await Order.findOne({ paymentId: req.params.orderId });

        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        if (order.status !== "Paid") {
            return res.status(400).json({ message: "Order cannot be canceled!" });
        }

        order.status = "Canceled";
        await order.save();

        res.json({ message: "Order canceled successfully!", order });
    } catch (error) {
        console.error("Error canceling order:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});


app.get("/api/checkUser", async (req, res) => {
    try {
        const { mobile } = req.query;
        const user = await User.findOne({ mobile });

        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Server error" });
    }
});


app.get("/api/sendOtp", async (req, res) => {
    try {
        const { mobile } = req.query;
        if (!mobile) {
            console.error("Error: Mobile number missing!");
            return res.status(400).json({ error: "Mobile number is required!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(`Attempting to send OTP: ${otp} to ${mobile}`);

        const message = await client.messages.create({
            body: `Your OTP is ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: mobile
        });

        console.log("Twilio response:", message.sid);
        res.json({ success: true, otp, messageId: message.sid });
    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(500).json({ error: "Failed to send OTP via SMS" });
    }
});

// **Mount the Router**
app.use('/api', router);

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
