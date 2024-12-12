// Function to show the next section of the form
function showSection(sectionId, button) {
    const section = document.getElementById(sectionId.trim());
    if (section) {
        section.style.display = 'block'; // Show the next section
        button.parentElement.style.display = 'none'; // Hide the button
    } else {
        console.error(`Section with ID "${sectionId}" not found.`);
    }
}

// Function to validate the current section before moving to the next
function validateSection(sectionId) {
    const section = document.getElementById(sectionId.trim());
    const inputs = section.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        if (input.required && !input.value) {
            isValid = false;
            input.classList.add('error'); // Add error class for styling
        } else {
            input.classList.remove('error'); // Remove error class if valid
        }
    });

    return isValid;
}

// Function to handle the Next button
function handleNextButtonClick(sectionId, nextSectionId, button) {
    if (validateSection(sectionId)) {
        showSection(nextSectionId, button);
    } else {
        alert('Please fill in all required fields.'); // Alert user to fill required fields
    }
}

// Function to show the OTP input section
function showOtpSection(otpSectionId) {
    const otpSection = document.getElementById(otpSectionId);
    if (otpSection) {
        otpSection.style.display = 'block'; // Show the OTP section
    } else {
        console.error(`OTP section with ID "${otpSectionId}" not found.`);
    }
}

// Function to verify the OTP
function verifyOtp(otpSectionId) {
    const otpInput = document.querySelector(`#${otpSectionId} input[name="${otpSectionId === 'emailOtpSection' ? 'emailOtp' : 'phoneOtp'}"]`);
    if (otpInput && otpInput.value) {
        alert(`OTP for ${otpSectionId === 'emailOtpSection' ? 'Email' : 'Phone'} verified successfully!`);
        // Optionally, you can hide the OTP section after verification
        const otpSection = document.getElementById(otpSectionId);
        otpSection.style.display = 'none';
        // Move to the next section after OTP verification
        if (otpSectionId === 'phoneOtpSection') {
            handleNextButtonClick('phoneOtpSection', 'AddressDetails', otpInput);
        }
    } else {
        alert('Please enter the OTP.'); // Alert if OTP is not entered
    }
}

// Submit the form (after the final section)
// function submitForm() {
//     alert("Form submitted successfully!\n Form is Under Review You Will be notified via email once it's approved.");
//     window.location.href = 'index.html';

//     // Optionally, handle form submission (e.g., send data to server)
// }
// Submit the form (after the final section)
// Submit the form (after the final section)
function submitForm() {
    // Collecting form data
    const formData = new FormData();

    formData.append("organizationName", document.getElementById("organizationName").value);
    formData.append("organizationType", document.getElementById("organizationType").value);
    formData.append("contactPersonName", document.getElementById("contactPersonName").value);
    formData.append("designation", document.getElementById("designation").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("city", document.getElementById("city").value);
    formData.append("state", document.getElementById("state").value);
    formData.append("country", document.getElementById("country").value);
    formData.append("companyRegNo", document.getElementById("companyRegNo").value);
    formData.append("gstNo", document.getElementById("gstNo").value);
    formData.append("websiteURL", document.getElementById("websiteURL").value);

    // Handle file upload
    const fileInput = document.getElementById("verificationDoc");
    if (fileInput.files.length > 0) {
        formData.append("verificationDoc", fileInput.files[0]);
    }

    // Sending form data using fetch API to the server's IPv6 address
    fetch("http://localhost:3000/register", { // Replace with the actual IPv6 address of the server
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error submitting form');
        }
        return response.json(); // Assuming the server sends a JSON response
    })
    .then(data => {
        console.log("Form submitted successfully:", data);
        alert("Registration Successful!");
        window.location.href = 'index.html'; // Redirect to home or another page
    })
    .catch(error => {
        console.error("Error submitting form:", error);
        alert("There was an error submitting the form. Please try again.");
    });
}
