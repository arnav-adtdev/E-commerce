document.addEventListener("DOMContentLoaded", async function () {
    const upiButton = document.getElementById("pay-upi");
    const cardButton = document.getElementById("pay-card");
    const qrButton = document.getElementById("pay-qr");
    const codButton = document.getElementById("pay-cod");
    const upiInput = document.getElementById("upi-id");
    const verifyButton = document.getElementById("verify-upi");
    const countdownDisplay = document.getElementById("countdown");

    let latestPaymentMethod = null;

    function hidePreviousMethod() {
        if (latestPaymentMethod) {
            latestPaymentMethod.style.display = "none";
            latestPaymentMethod.disabled = false;
        }
    }

    // ✅ Function to Store User Session Properly
    function storeUserSession(userId) {
        if (userId) {
            sessionStorage.setItem("userId", userId);
            console.log("User ID stored:", sessionStorage.getItem("userId"));
        } else {
            console.error("Failed to store user ID.");
        }
    }

    // ✅ Function to Validate User Session & Fetch from DB if Needed
    async function validateUserSession() {
        let userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");

        if (!userId) {
            try {
                const response = await fetch("/get-user");
                const data = await response.json();
                if (data.success) {
                    userId = data.userId;
                    sessionStorage.setItem("userId", userId);
                    console.log("User ID fetched from backend:", userId);
                } else {
                    alert("User not logged in! Please log in.");
                    return false;
                }
            } catch (error) {
                console.error("Error fetching user ID:", error);
                return false;
            }
        }

        console.log("User logged in with ID:", userId);
        return userId;
    }


    // ✅ Verify UPI ID Before Allowing Payment
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

    // ✅ Function to Get Checkout Total
    function getCheckoutTotal() {
        const amountElement = document.getElementById("checkout-total");

        if (!amountElement) {
            alert("Error: Checkout total not found. Please refresh the page or try again.");
            return null;
        }

        return amountElement.innerText.replace(/₹/g, "").trim();
    }

    // ✅ UPI Payment Redirect
    upiButton.addEventListener("click", async function () {
        let userId = await validateUserSession();
        if (!userId) return;

        let upiValue = upiInput.value.trim();
        if (!upiValue.includes("@")) {
            alert("Please enter a valid UPI ID.");
            return;
        }

        let transactionId = "TXN" + Date.now();
        let amount = getCheckoutTotal();
        if (!amount) return;

        let upiUrl = `upi://pay?pa=${upiValue}&pn=StoreName&mc=0000&tid=${transactionId}&tr=${transactionId}&tn=Order Payment&am=${amount}&cu=INR`;

        console.log("UPI URL:", upiUrl);
        window.location.href = upiUrl;
    });

    // ✅ Razorpay Card Payment
    cardButton.addEventListener("click", async function () {
        let userId = await validateUserSession();
        if (!userId) return;

        let amount = getCheckoutTotal();
        if (!amount) return;

        var options = {
            key: "YOUR_RAZORPAY_KEY",
            amount: amount * 100,
            currency: "INR",
            name: "Your Store",
            description: "Order Payment",
            image: "/path-to-your-logo.png",
            handler: function (response) {
                alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
                saveOrderDetails(response.razorpay_payment_id, amount, "Card", userId);
                window.location.href = "/thank-you";
            },
            prefill: { name: "Customer", email: "user@example.com", contact: "07068361837" },
            theme: { color: "#3399cc" }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();
    });

    // ✅ Cash on Delivery Payment
    codButton.addEventListener("click", async function () {
        let userId = await validateUserSession();
        if (!userId) return;

        hidePreviousMethod();
        latestPaymentMethod = codButton;
        sessionStorage.removeItem("cart");
        alert("Order placed successfully with Cash on Delivery.");
        saveOrderDetails(null, "COD", "Cash on Delivery", userId);
        window.location.href = "/thank-you";
    });

    // ✅ Function to Send Order Data to Backend
    function saveOrderDetails(paymentId, amount, method, userId) {
        let itemsInCart = JSON.parse(sessionStorage.getItem("cart")) || [];

        // ✅ Ensure amount is a number for non-COD payments
        let finalAmount = method === "Cash on Delivery" ? 0 : parseFloat(amount);

        fetch('/saveOrder', {
            method: 'POST',
            body: JSON.stringify({
                paymentId: paymentId || "COD",
                items: itemsInCart,
                totalAmount: finalAmount, // ✅ Fix: Pass number instead of "COD"
                paymentMethod: method,
                user: userId
            }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => console.log("Order saved:", data))
        .catch(error => console.error("Error saving order:", error));
    }


});
