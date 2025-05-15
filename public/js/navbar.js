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

        if (!/^\d{10}$/.test(phoneNumber)) {
            showAlert("Enter a valid 10-digit mobile number");
            return;
        }

        const formattedPhoneNumber = `+91${phoneNumber}`;

        try {
            const response = await fetch("http://localhost:3000/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
            });

            const data = await response.json();
            if (data.success) {
                showAlert("OTP sent successfully!");
                otpSection.classList.remove("d-none");
                verifyOtpBtn.classList.remove("d-none");
                resendOtpBtn.classList.remove("d-none"); // Show Resend OTP button
                initializeResendOtpTimer(); // Start countdown timer
            } else {
                showAlert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("API Error:", error);
            showAlert(`Error sending OTP: ${error.message}`);
        }
    };
    

    // **Resend OTP Timer Function**
    const initializeResendOtpTimer = () => {
        let countdown = 60; // 1 minutes
        resendOtpBtn.disabled = true;
        resendOtpBtn.classList.remove("d-none"); // Ensure visibility

        resendOtpBtn.textContent = `Resend OTP (1:00)`;

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

    const handleResendOtp = async () => {
        // showAlert("Resending OTP...");
        resendOtpBtn.disabled = true;
        initializeResendOtpTimer(); // Restart countdown

        try {
            const phoneNumber = mobileInput.value.trim();
            const formattedPhoneNumber = `+91${phoneNumber}`;

            console.log(`Sending request to backend with phone: ${formattedPhoneNumber}`);

            const response = await fetch("http://localhost:3000/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
            });

            const text = await response.text(); // Read response as text first
            console.log("Raw API Response:", text);

            try {
                const data = JSON.parse(text);
                if (data.success) {
                    showAlert(`New OTP sent successfully! OTP`);
                } else {
                    showAlert(`Error: ${data.message}`);
                }
            } catch (jsonError) {
                console.error("Response is not valid JSON:", text);
                showAlert("Error: Server returned an invalid response.");
            }
        } catch (error) {
            console.error("Network Error:", error);
            showAlert(`Error: ${error.message}`);
        }
    };




    // **Verify OTP and Save User Logic**
    const handleVerifyOtp = async () => {
        const firstName = document.getElementById("firstName")?.value.trim();
        const lastName = document.getElementById("lastName")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const mobileInput = document.getElementById("mobile");
        const otpInput = document.getElementById("otp");

        if (!firstName || !lastName || !email || !mobileInput || !otpInput) {
            showAlert("All fields are required!");
            return;
        }

        const mobile = mobileInput.value.trim();
        const otp = otpInput.value.trim();

        if (!/^\d{6}$/.test(otp)) {
            showAlert("Please enter a valid 6-digit OTP.");
            return;
        }

        try {
            console.log(`Sending OTP verification for: ${mobile}, OTP: ${otp}`);
            const response = await fetch("http://localhost:3000/save-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, mobile, otp }),
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (data.success) {
                showAlert("User saved successfully!");
                console.log("User Info:", data.user);
            } else {
                const errorMessage = data.message || "Unexpected error occurred.";
                showAlert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error saving user:", error);
            showAlert(`Error: ${error.message}`);
        }
    };


   // **Toggle Visibility for Divs**
    const toggleDivs = () => {
        if (upperDiv && lowerDiv) {
            upperDiv.classList.add("d-none");
            lowerDiv.classList.remove("d-none");
        }
    };

    // **Attach Event Listeners**
    sendOtpBtn.addEventListener("click", handleSendOtp);
    resendOtpBtn.addEventListener("click", handleResendOtp);
    verifyOtpBtn.addEventListener("click", handleVerifyOtp);

    // Initialize Geolocation on page load
    initializeGeolocation();
});