document.addEventListener("DOMContentLoaded", function () {
    const ordersList = document.getElementById("ordersList");

    // ✅ Fetch orders from API or local storage
    function fetchOrders() {
        fetch("/api/orders") // Replace with your actual API endpoint
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                return response.json();
            })
            .then(orders => {
                displayOrders(orders);
            })
            .catch(error => {
                console.error("Error fetching orders:", error);
                ordersList.innerHTML = `<p class="text-danger text-center">⚠️ Failed to load orders.</p>`;
            });
    }

    // ✅ Display orders in the UI
    function displayOrders(orders) {
        if (!orders.length) {
            ordersList.innerHTML = `<p class="text-muted text-center">No orders found.</p>`;
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="card mb-3 p-3 shadow-sm">
                <h5 class="fw-bold text-primary">Order #${order.id}</h5>
                <p><strong>Product:</strong> ${order.productName}</p>
                <p><strong>Quantity:</strong> ${order.quantity}</p>
                <p><strong>Price:</strong> ₹${order.price}</p>
                <p><strong>Status:</strong> <span class="badge bg-success">${order.status}</span></p>
            </div>
        `).join("");
    }

    fetchOrders(); // ✅ Call function to load orders
});
