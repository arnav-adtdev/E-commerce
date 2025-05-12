document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const locationSpan = document.getElementById("location");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const mobileInput = document.getElementById("mobile");
    const otpSection = document.getElementById("otpSection");
    const otpInput = document.getElementById("otp");
    const resendOtpBtn = document.getElementById("resendOtpBtn");
    const upperDiv = document.getElementById("registeredDivUpper");
    const lowerDiv = document.getElementById("registeredDivLower");

    // Utility function to show alerts
    const showAlert = (message) => alert(message);

    // Geolocation Logic
    const initializeGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then((response) => response.json())
                        .then((data) => {
                            locationSpan.textContent = data.display_name || "Location not found";
                        })
                        .catch((error) => {
                            console.error("Location API Error:", error);
                            locationSpan.textContent = "Unable to get location";
                        });
                },
                (error) => {
                    const geolocationErrorMessages = {
                        1: "Location access denied by user.",
                        2: "Unable to retrieve location information.",
                        3: "Location request timed out.",
                    };
                    console.error("Geolocation error:", error);
                    locationSpan.textContent = geolocationErrorMessages[error.code] || "Unknown error occurred.";
                }
            );
        } else {
            locationSpan.textContent = "Geolocation not supported";
        }
    };

    // Send OTP Logic
    const handleSendOtp = async () => {
        const phoneNumber = mobileInput.value.trim();
    
        // Validate phone number format
        if (!/^\d{10}$/.test(phoneNumber)) {
            showAlert("Enter a valid 10-digit mobile number");
            return;
        }
    
        // Prepend country code
        const formattedPhoneNumber = `+91${phoneNumber}`;
    
        try {
            const response = await axios.post("http://localhost:3000/send-otp", { phoneNumber: formattedPhoneNumber });
    
            if (response.data.success) {
                showAlert("OTP sent successfully!");
                otpSection.classList.remove("d-none");
                verifyOtpBtn.classList.remove("d-none");
            } else {
                // Handle backend-sent errors explicitly
                showAlert(`Error: ${response.data.message}`);
            }
        } catch (error) {
            // Handle all error cases, including validation and connection issues
            console.error("API Error:", error.response?.data || error.message);
            if (error.response && error.response.data && error.response.data.message) {
                showAlert(`Error: ${error.response.data.message}`);
            } else {
                showAlert(`Error sending OTP: ${error.message}`);
            }
        }
    };
    
    

    // Timer for Resend OTP
    const initializeResendOtpTimer = () => {
        resendOtpBtn.disabled = true;
        resendOtpBtn.classList.remove("d-none");

        let countdown = 120; // 2 minutes
        const timerInterval = setInterval(() => {
            if (countdown > 0) {
                const minutes = Math.floor(countdown / 60);
                const seconds = countdown % 60;
                resendOtpBtn.textContent = `Resend OTP (${minutes}:${seconds.toString().padStart(2, '0')})`;
                countdown--;
            } else {
                clearInterval(timerInterval);
                resendOtpBtn.textContent = "Resend OTP";
                resendOtpBtn.disabled = false; // Enable Resend OTP
            }
        }, 1000);
    };

    // Resend OTP Logic
    const handleResendOtp = () => {
        showAlert("Resending OTP...");
        resendOtpBtn.disabled = true;
        initializeResendOtpTimer(); // Reinitialize countdown
    };

    // Verify OTP and Save User Logic
    const handleVerifyOtp = async () => {
        const firstName = document.getElementById("firstName")?.value.trim();
        const lastName = document.getElementById("lastName")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const mobile = mobileInput.value.trim();
        const otp = otpInput?.value.trim();

        if (!firstName || !lastName || !email || !mobile || !otp) {
            showAlert("All fields are required!");
            return;
        }

        if (!/^\d{6}$/.test(otp)) { // Assuming OTP is a 6-digit number
            showAlert("Please enter a valid 6-digit OTP.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/save-user", {
                firstName,
                lastName,
                email,
                mobile,
                otp,
            });

            if (response.data.success) {
                showAlert("User saved successfully!");
                console.log("User Info:", response.data.user);
            } else {
                showAlert(`Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Error saving user:", error.response?.data || error.message);
            showAlert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    // Function to toggle visibility of upper and lower divs
    const toggleDivs = () => {
        if (upperDiv && lowerDiv) {
            upperDiv.classList.add("d-none");
            lowerDiv.classList.remove("d-none");
        }
    };

    // Event Listeners
    sendOtpBtn.addEventListener("click", handleSendOtp);
    resendOtpBtn.addEventListener("click", handleResendOtp);
    verifyOtpBtn.addEventListener("click", handleVerifyOtp);

    // Initialize Geolocation on page load
    initializeGeolocation();
});