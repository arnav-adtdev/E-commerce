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
    const showAlert = (message) => {
        alert(message);
    };

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
                        .catch(() => {
                            locationSpan.textContent = "Unable to get location";
                        });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    locationSpan.textContent = "Location access denied";
                }
            );
        } else {
            locationSpan.textContent = "Geolocation not supported";
        }
    };

    // Send OTP Logic
    const handleSendOtp = async () => {
        const phoneNumber = mobileInput.value.trim();

        if (!/^\d{10}$/.test(phoneNumber)) {
            showAlert("Enter a valid 10-digit mobile number");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/send-otp", { phoneNumber: `+91${phoneNumber}` });
            if (response.data.success) {
                showAlert("OTP sent successfully!");

                // Show OTP section and Verify button
                otpSection.classList.remove("d-none");
                verifyOtpBtn.classList.remove("d-none");

                toggleDivs(); // Switch Upper and Lower Divs

                // Timer logic for Resend OTP button
                initializeResendOtpTimer();
            } else {
                showAlert(`Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error("API Error:", error);
            showAlert(`Error sending OTP: ${error.message}`);
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
                resendOtpBtn.textContent = `Resend OTP (${minutes}:${seconds < 10 ? "0" : ""}${seconds})`;
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
            console.error("Error saving user:", error);
            showAlert(`Error: ${error.message}`);
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
