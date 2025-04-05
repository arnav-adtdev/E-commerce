document.addEventListener("DOMContentLoaded", function () {
    const locationSpan = document.getElementById("location");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const mobileInput = document.getElementById("mobile");
    const otpSection = document.getElementById("otpSection");
    const otpInput = document.getElementById("otp");
    const nameInput = document.querySelector("input[placeholder='Enter Your Name']");
    const resendOtpBtn = document.getElementById("resendOtpBtn");
    const upperDiv = document.getElementById("registeredDivUpper");
    const lowerDiv = document.getElementById("registeredDivLower");

    // Geolocation Logic
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        locationSpan.textContent = data.display_name || "Location not found";
                    })
                    .catch(() => {
                        locationSpan.textContent = "Unable to get location";
                    });
            },
            function (error) {
                console.error("Geolocation error:", error);
                locationSpan.textContent = "Location access denied";
            }
        );
    } else {
        locationSpan.textContent = "Geolocation not supported";
    }

    // Send OTP Logic
    sendOtpBtn.addEventListener("click", async () => {
        const phoneNumber = mobileInput.value.trim();
        if (!phoneNumber.match(/^\d{10}$/)) {
            alert("Enter a valid 10-digit mobile number");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/send-otp", { phoneNumber: `+91${phoneNumber}` });
            if (response.data.success) {
                alert("OTP sent successfully!");
                otpSection.classList.remove("d-none");
                verifyOtpBtn.classList.remove("d-none");

                toggleDivs(); // Call toggleDivs to hide upperDiv and show lowerDiv

                // Timer logic for Resend OTP button
                resendOtpBtn.disabled = true;
                resendOtpBtn.classList.remove("d-none");
                let countdown = 120; // Countdown in seconds

                const timerInterval = setInterval(() => {
                    if (countdown > 0) {
                        const minutes = Math.floor(countdown / 60);
                        const seconds = countdown % 60;
                        resendOtpBtn.textContent = `Resend OTP (${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;
                        countdown--;
                    } else {
                        clearInterval(timerInterval);
                        resendOtpBtn.textContent = "Resend OTP";
                        resendOtpBtn.disabled = false; // Enable Resend OTP
                    }
                }, 1000);
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Error sending OTP: " + error.message);
        }
    });

    // Resend OTP Logic
    resendOtpBtn.addEventListener("click", () => {
        alert("Resending OTP...");
        resendOtpBtn.disabled = true;
        resendOtpBtn.textContent = "Resend OTP (120s)";

        // Repeat timer logic for subsequent resends
        let countdown = 120;
        const timerInterval = setInterval(() => {
            if (countdown > 0) {
                const minutes = Math.floor(countdown / 60);
                const seconds = countdown % 60;
                resendOtpBtn.textContent = `Resend OTP (${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;
                countdown--;
            } else {
                clearInterval(timerInterval);
                resendOtpBtn.textContent = "Resend OTP";
                resendOtpBtn.disabled = false;
            }
        }, 1000);
    });

    // Verify OTP and Save User Logic
    document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const otp = document.getElementById("otp").value.trim();
    
        if (!firstName || !lastName || !email || !mobile || !otp) {
            alert("All fields are required!");
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:3000/save-user", {
                firstName,
                lastName,
                email,
                mobile,
                otp
            });
    
            if (response.data.success) {
                alert("User saved successfully!");
                console.log("User Info:", response.data.user);
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Error: " + error.message);
        }
    });
    

    // Function to toggle visibility of upper and lower divs
    function toggleDivs() {
        console.log("Upper Div:", upperDiv);
        console.log("Lower Div:", lowerDiv);

        if (upperDiv && lowerDiv) {
            upperDiv.classList.add("d-none");
            lowerDiv.classList.remove("d-none");
            console.log("Toggle success!");
        }
    }
});
