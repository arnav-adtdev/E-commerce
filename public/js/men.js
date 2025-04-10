document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
      button.addEventListener('click', function () {
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ name, price, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Item added to the cart!');
      });
    });

    // Add event listener for navigating to the cart
    const cartButton = document.getElementById('cart-button'); // Assuming you have a Cart button
    if (cartButton) {
      cartButton.addEventListener('click', function () {
        window.location.href = '/cart'; // Navigate to the cart page
      });
    }
  });