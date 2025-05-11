document.addEventListener("DOMContentLoaded", function () {
    const upiButton = document.getElementById("pay-upi");
    const cardButton = document.getElementById("pay-card");
    const qrButton = document.getElementById("pay-qr");
    const codButton = document.getElementById("pay-cod");
    const upiInput = document.getElementById("upi-id");
    const verifyButton = document.getElementById("verify-upi");
    const countdownDisplay = document.getElementById("countdown");

    let latestPaymentMethod = null; // Track the latest payment method

    function hidePreviousMethod() {
        if (latestPaymentMethod) {
            latestPaymentMethod.style.display = "none";
            latestPaymentMethod.disabled = false;
        }
    }

    // Verify UPI ID Before Allowing Payment
    verifyButton.addEventListener("click", function () {
        let upiValue = upiInput.value.trim();
        let upiPattern = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/;

        if (!upiPattern.test(upiValue)) {
            alert("Invalid UPI ID! Please enter a valid UPI ID.");
            upiButton.disabled = true;
        } else {
            alert("UPI ID Verified!");
            upiButton.disabled = false;
        }
    });

    // UPI Payment Redirect
    upiButton.addEventListener("click", function () {
        let upiValue = upiInput.value.trim();
        if (!upiValue.includes("@")) {
            alert("Please enter a valid UPI ID.");
            return;
        }

        let transactionId = "TXN" + Date.now();
        let amountElement = document.getElementById("checkout-total");
        let amount = amountElement ? amountElement.innerText.replace(/₹/g, "").trim() : "0";

        if (isNaN(parseFloat(amount))) {
            alert("Invalid amount detected.");
            return;
        }

        let upiUrl = `upi://pay?pa=${upiValue}&pn=Arnav Store&mc=0000&tid=${transactionId}&tr=${transactionId}&tn=Order Payment&am=${amount}&cu=INR`;

        console.log("UPI URL:", upiUrl);
        window.location.href = upiUrl; // Redirect to UPI app
    });

    // Razorpay Card Payment
    cardButton.addEventListener("click", function () {
        let amount = 1753.00;
        var options = {
            key: "YOUR_RAZORPAY_KEY",
            amount: amount * 100,
            currency: "INR",
            name: "Your Store",
            description: "Order Payment",
            image: "/path-to-your-logo.png",
            handler: function (response) {
                alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
                window.location.href = "/thank-you";
            },
            prefill: { name: "Arnav", email: "user@example.com", contact: "07068361837" },
            theme: { color: "#3399cc" }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();
    });

    // QR Code Payment with Countdown Timer
    qrButton.addEventListener("click", function () {
        const qrModal = new bootstrap.Modal(document.getElementById("qrModal"));
        qrModal.show();

        let timeLeft = 300; // 5 minutes

        const timerInterval = setInterval(function () {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            countdownDisplay.innerText = `This QR code will expire in: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(timerInterval);
                alert("Payment session expired! Please try again.");
                qrModal.hide();
            }
        }, 1000);
    });

    // Cash on Delivery Payment
    codButton.addEventListener("click", function () {
        hidePreviousMethod();
        latestPaymentMethod = codButton;
        localStorage.removeItem("cart");
        alert("Order placed successfully with Cash on Delivery.");
        window.location.href = "/thank-you";
    });
});
