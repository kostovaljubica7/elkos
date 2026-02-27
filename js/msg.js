
    document.getElementById("contactForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission

        const form = event.target;
        const formData = new FormData(form);

        // Show the loader and hide the submit button
        const loader = document.getElementById("loader");
        const submitButton = form.querySelector('button[type="submit"]');
        loader.style.display = "block";  // Show loader
        submitButton.disabled = true;   // Disable submit button to prevent multiple submissions

        // Hide any previous notifications
        const notificationDiv = document.getElementById("form-response");
        notificationDiv.style.display = "none"; // Hide the previous notification (if any)

        // Send the form data to Formspree via fetch API
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Success: Show success message
                document.getElementById("response-message").textContent = "Вашата порака беше успешно испратена!";
                notificationDiv.classList.remove("alert-danger"); // Remove error class
                notificationDiv.classList.add("alert-success"); // Add success class
            } else {
                // Failure: Show error message
                document.getElementById("response-message").textContent = "Грешка при испраќање. Обидете се повторно.";
                notificationDiv.classList.remove("alert-success"); // Remove success class
                notificationDiv.classList.add("alert-danger"); // Add error class
            }
            notificationDiv.style.display = "block"; // Show the notification

            // Hide loader after a few seconds
            setTimeout(() => {
                loader.style.display = "none";  // Hide loader
                submitButton.disabled = false; // Enable the submit button again
            }, 3000); // Hide loader after 3 seconds

            // Clear the form inputs
            form.reset();

            // Hide notification after a few seconds
            setTimeout(() => {
                notificationDiv.style.display = "none"; // Hide notification
            }, 5000); // Hide notification after 5 seconds
        })
        .catch(error => {
            console.error('Error:', error);
            // Show error message
            document.getElementById("response-message").textContent = "Се случи грешка. Ве молиме обидете се повторно.";
            notificationDiv.classList.remove("alert-success"); // Remove success class
            notificationDiv.classList.add("alert-danger"); // Add error class
            notificationDiv.style.display = "block"; // Show the notification

            // Hide loader after a few seconds
            setTimeout(() => {
                loader.style.display = "none";  // Hide loader
                submitButton.disabled = false; // Enable the submit button again
            }, 3000); // Hide loader after 3 seconds

            // Clear the form inputs after showing the error message
            setTimeout(() => {
                form.reset();
            }, 5000); // Clear the form after the notification is hidden
        });
    });

document.getElementById("submitButtonFooter").addEventListener("click", function() {
    const emailInput = document.getElementById("emailInput");
    const email = emailInput.value.trim(); // Get the email value and trim it

    if (email === "") {
        showNotification('Error: Please enter a valid email address.', 'danger');
        return;
    }

    // Show loader and disable the submit button
    const loader = document.getElementById("loaderFooter");
    const submitButton = document.getElementById("submitButtonFooter");
    loader.style.display = "block"; // Show loader
    submitButton.disabled = true;   // Disable the submit button to prevent multiple submissions

    const formData = new FormData();
    formData.append('email', email);

    // Send the email using AJAX (Fetch API)
    fetch('https://formspree.io/f/xdkovwza', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        loader.style.display = "none"; // Hide loader
        if (data.ok) {
            showNotification('Your message has been successfully sent!', 'success');
            emailInput.value = ""; // Clear the input field
        } else {
            showNotification('Something went wrong, please try again.', 'danger');
        }
    })
    .catch(error => {
        loader.style.display = "none"; // Hide loader
        showNotification('Error: ' + error.message, 'danger');
    })
    .finally(() => {
        // Re-enable submit button after response or error
        submitButton.disabled = false;
    });

    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.classList.remove('alert-success', 'alert-danger');
        notification.classList.add('alert-' + type);
        notification.innerHTML = '<strong>' + message + '</strong>';
        notification.style.display = 'block'; 

        setTimeout(function() {
            notification.style.display = 'none';
        }, 3000); 
    }
});

