document.addEventListener("DOMContentLoaded", function () {
    const upiButton = document.getElementById("pay-upi");
    const cardButton = document.getElementById("pay-card");
    const qrButton = document.getElementById("pay-qr");
    const codButton = document.getElementById("pay-cod");

    // UPI Payment Redirect
    upiButton.addEventListener("click", function () {
        let upiId = "your-upi-id@phonepe"; // Replace with actual UPI ID
        let amount = 1753.00;
        let transactionId = "TXN" + Date.now();
        let url = `upi://pay?pa=${upiId}&pn=Your Store&mc=0000&tid=${transactionId}&tr=${transactionId}&tn=Order Payment&am=${amount}&cu=INR`;
        window.location.href = url;
    });

    // Razorpay Card Payment
    cardButton.addEventListener("click", function () {
        var options = {
            key: "YOUR_RAZORPAY_KEY", // Get this from Razorpay Dashboard
            amount: 175300, // Convert ₹1753 to paisa (multiply by 100)
            currency: "INR",
            name: "Your Store",
            description: "Order Payment",
            image: "/path-to-your-logo.png",
            handler: function (response) {
                alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
                window.location.href = "/thank-you";
            },
            prefill: {
                name: "Arnav",
                email: "user@example.com",
                contact: "07068361837"
            },
            theme: { color: "#3399cc" }
        };
        
        var rzp1 = new Razorpay(options);
        rzp1.open();
    });

    // QR Code Payment
    qrButton.addEventListener("click", function () {
        alert("Please scan the QR code to proceed with payment.");
    });

    // Cash on Delivery (COD)
    codButton.addEventListener("click", function () {
        alert("Order placed successfully with Cash on Delivery.");
        window.location.href = "/thank-you";
    });
});
