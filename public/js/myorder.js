document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId"); // Retrieve logged-in user ID

    if (!userId) {
        alert("Please log in to view your orders.");
        return;
    }

    fetch(`/getOrders/${userId}`)
        .then(response => response.json())
        .then(data => {
            const ordersList = document.getElementById("ordersList");
            const orderSuccessMessage = document.getElementById("orderSuccessMessage");
            ordersList.innerHTML = "";

            if (data.length > 0) {
                orderSuccessMessage.style.display = "block"; // Show success message
            } else {
                orderSuccessMessage.innerText = "No orders found!";
                orderSuccessMessage.style.display = "block";
            }

            data.forEach(order => {
                ordersList.innerHTML += `
                    <div class="card p-3 mb-3">
                        <h4 class="text-primary">Order ID: ${order.paymentId}</h4>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                        <p><strong>Total Amount:</strong> ₹${order.amount}</p>
                        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                        <p><strong>Estimated Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
                        <p><strong>Tracking Status:</strong> ${order.trackingStatus}</p>
                    </div>`;
            });
        })
        .catch(error => console.error("Error fetching orders:", error));
});
