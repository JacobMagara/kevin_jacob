// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get form input values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate form inputs
    if (!email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    // Prepare the data for submission
    const data = {
        email,
        password
    };

    try {
        // Send a POST request to the login endpoint
        const response = await fetch('/login', { // Correct endpoint for login
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Parse the response
        const result = await response.json();

        if (result.success) {
            // Redirect to the home page on successful login
            window.location.href = '/home'; // Redirect to home page
        } else {
            // Show error message on failed login
            alert(result.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
