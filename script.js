document.addEventListener("DOMContentLoaded", () => {
    // Attach click event listeners to all "Buy Now" buttons
    const buyButtons = document.querySelectorAll(".buy-button");

    buyButtons.forEach(button => {
        button.addEventListener("click", event => {
            const productCard = event.target.closest(".product-card"); // Get the closest product card
            const productName = productCard.querySelector(".product-name").textContent; // Get the product name
            const productPrice = productCard.querySelector(".product-price").textContent; // Get the product price
            const productImage = productCard.querySelector("img").src; // Get the product image source
            
            // Create a product object
            const product = {
                name: productName,
                price: productPrice,
                image: productImage
            };

            addToCart(product); // Add product to cart
        });
    });
});

// Function to add a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || []; // Retrieve the cart or initialize it
    cart.push(product); // Add the new product to the cart
    localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
    alert(`${product.name} has been added to your cart!`);
}
