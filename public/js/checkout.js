document.addEventListener("DOMContentLoaded", function () {
    const checkoutItemsContainer = document.getElementById("checkout-items");
    const checkoutTotalElement = document.getElementById("checkout-total");
    const discountCheckbox = document.getElementById("discount-checkbox");
    const continueButton = document.getElementById("continue-btn");
    const saveAddressButton = document.getElementById("save-address-btn");
    const savedAddressContainer = document.getElementById("saved-address");
    const billingForm = document.getElementById("billing-form");
    const stateDropdown = document.getElementById("state");
    const cityInput = document.getElementById("city");
    const billingFormInputs = document.querySelectorAll("#billing-form input, #billing-form select");

    const discountAmount = 58.00;
    const deliveryCharge = 40.00;
    let cart = JSON.parse(localStorage.getItem("checkoutCart")) || [];
    let loyaltyRs = parseFloat(localStorage.getItem("loyaltyRs")) || 58.00; // Ensure default value

    function updateCheckoutTotal() {
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let finalAmount = total + deliveryCharge;

        if (discountCheckbox.checked) {
            finalAmount -= loyaltyRs; // Apply loyalty points when checked
            localStorage.setItem("loyaltyUsed", true); // Store checkbox state
        } else {
            localStorage.removeItem("loyaltyUsed"); // Remove applied discount if unchecked
        }

        checkoutTotalElement.innerText = `Total Amount Payable: ₹${finalAmount.toFixed(2)}`;
    }

    function loadCheckout() {
        checkoutItemsContainer.innerHTML = "";
        if (cart.length === 0) {
            checkoutItemsContainer.innerHTML = `<tr><td colspan="4" class="text-center text-muted fs-5">No items in cart</td></tr>`;
            checkoutTotalElement.innerText = "Total Amount Payable: ₹0";
            return;
        }

        cart.forEach((item) => {
            const row = document.createElement("tr");
            const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
            row.innerHTML = `
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>${item.quantity}</td>
                <td>₹${itemTotal}</td>
            `;
            checkoutItemsContainer.appendChild(row);
        });

        updateCheckoutTotal(); // Ensure the amount updates correctly
    }

    loadCheckout();

    if (stateDropdown) {
        stateDropdown.addEventListener("change", updateCities);
    }

    function updateCities() {
        const state = stateDropdown?.value;
        if (!cityInput) {
            console.error("City input element not found!");
            return;
        }

        const stateCities = {
            "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
            "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
            "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
            "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
            "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba"],
            "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
            "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
            "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala"],
            "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu"],
            "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
            "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli"],
            "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
            "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
            "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
            "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
            "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
            "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
            "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Zunheboto"],
            "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
            "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
            "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
            "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
            "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
            "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
            "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar"],
            "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur", "Agra", "Varanasi"],
            "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani"],
            "West Bengal": ["Kolkata", "Darjeeling", "Asansol", "Howrah"]
            
        };

        cityInput.innerHTML = `<option value="" disabled selected>Select City</option>`;

        if (stateCities[state]) {
            stateCities[state].forEach(city => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                cityInput.appendChild(option);
            });
        }
    }

    if (saveAddressButton) {
        saveAddressButton.addEventListener("click", function () {
            const fullName = document.querySelector("input[name='fullname']")?.value.trim();
            const phone = document.querySelector("input[name='phone']")?.value.trim();
            const pincode = document.querySelector("input[name='pincode']")?.value.trim();
            const state = document.getElementById("state")?.value.trim();
            const city = document.getElementById("city")?.value.trim();
            const house = document.querySelector("input[name='house']")?.value.trim();
            const road = document.querySelector("input[name='road']")?.value.trim();

            if (fullName && phone && pincode && state && city && house && road) {
                const savedAddress = `<strong>Saved Address:</strong> ${fullName}, ${phone}, ${house}, ${road}, ${city}, ${state} - ${pincode}`;

                savedAddressContainer.innerHTML = savedAddress;
                savedAddressContainer.style.display = "block";

                // Hide billing form properly
                billingForm.style.transition = "opacity 0.5s ease-out";
                billingForm.style.opacity = "0";
                setTimeout(() => {
                    billingForm.style.display = "none";
                }, 500);
            } else {
                alert("Please fill in all fields before saving the address.");
            }
        });
    }

    // ✅ Disable "Continue" button until all billing details are filled
    function checkFormCompletion() {
        let allFilled = true;

        billingFormInputs.forEach(input => {
            if (!input.value.trim()) {
                allFilled = false;
            }
        });

        continueButton.disabled = !allFilled;
    }

    continueButton.disabled = true; // Disable initially

    billingFormInputs.forEach(input => {
        input.addEventListener("input", checkFormCompletion);
        input.addEventListener("change", checkFormCompletion);
    });

    if (continueButton) {
        continueButton.addEventListener("click", function () {
            window.location.href = "/payment"; // Redirects to payment page
        });
    } else {
        console.error("Error: 'Continue' button not found!");
    }

    // ✅ Fix: Ensure loyalty checkbox updates the total correctly
    discountCheckbox.addEventListener("change", updateCheckoutTotal);

    // ✅ Load previous checkbox state on page load
    if (localStorage.getItem("loyaltyUsed") === "true") {
        discountCheckbox.checked = true;
        updateCheckoutTotal(); // Apply discount immediately if checked
    }
});
