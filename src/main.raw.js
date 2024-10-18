import './styles.raw.css';

(function () {
  'use strict';

  // DOM Elements
  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const dropdown = document.querySelector('.services-mobile-dropdown');
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.card');
  const serviceDescriptions = document.querySelectorAll('.service-description');
  const contactSubmitButton = document.getElementById('contact-form-submit');
  const captchaTokenInput = document.getElementById('captchaToken');
  const currentYearElement = document.getElementById('current-year');
  const contactForm = document.querySelector('.contact-form');
  const fullnameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const termsCheckbox = document.getElementById('terms');
  const loadingOverlay = document.getElementById('loading-overlay');
  const successMessage = document.getElementById('success-message');
  const errorMessageContainer = document.getElementById('error-message');

  // Initialize
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  if (contactSubmitButton) {
    contactSubmitButton.disabled = true;
  }

  // Captcha Callback Functions
  window.CFTurnstilCallback = function (token) {
    console.log('Captcha token received:', token);
    if (contactSubmitButton) contactSubmitButton.disabled = false;
    if (captchaTokenInput) captchaTokenInput.value = token;
  };

  window.CFTurnstilReset = function () {
    if (contactSubmitButton) contactSubmitButton.disabled = true;
    if (captchaTokenInput) captchaTokenInput.value = '';
  };

  function showSuccessMessage() {
    if (successMessage) {
      successMessage.style.display = 'block';
    }
  }

  function hideContactForm() {
    if (contactForm) {
      contactForm.style.display = 'none';
    }
  }

  function showLoadingOverlay() {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
    }
  }

  function hideLoadingOverlay() {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  function showErrorMessage() {
    if (errorMessageContainer) {
      errorMessageContainer.style.display = 'block';
    }
  }

  function hideErrorMessage() {
    if (errorMessageContainer) {
      errorMessageContainer.style.display = 'none';
    }
  }

  // Helper Functions
  function updateDisplayedContent(selectedValue) {
    cards.forEach(card => {
      card.style.display = card.getAttribute('data-key') === selectedValue ? 'block' : 'none';
    });
    serviceDescriptions.forEach(description => {
      description.style.display = description.getAttribute('data-key') === selectedValue ? 'block' : 'none';
    });
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      const inputElement = errorElement.previousElementSibling;
      if (inputElement) inputElement.classList.add('error');
    }
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(element => {
      element.style.display = 'none';
    });
    document.querySelectorAll('.error').forEach(element => {
      element.classList.remove('error');
    });
  }

  function validateEmail(email) {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  }

  // Event Listeners
  if (dropdownButton && dropdown) {
    dropdownButton.addEventListener('click', () => {
      dropdown.classList.toggle('active');
    });
  }

  dropdownItems.forEach(item => {
    item.addEventListener('click', event => {
      const selectedValue = event.target.getAttribute('data-key');
      updateDisplayedContent(selectedValue);
      if (dropdown) dropdown.classList.remove('active');
      if (dropdownButton) dropdownButton.textContent = event.target.textContent;
    });
  });

  if (dropdown) {
    dropdown.addEventListener('change', event => {
      const selectedValue = event.target.value;
      updateDisplayedContent(selectedValue);
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const selectedValue = tab.getAttribute('data-key');
      updateDisplayedContent(selectedValue);
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      clearErrors();
      hideErrorMessage();
      showLoadingOverlay();

      const fullname = fullnameInput ? fullnameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      const captchaToken = captchaTokenInput ? captchaTokenInput.value.trim() : '';
      const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;

      let isValid = true;

      if (!fullname) {
        showError('fullname-error', 'Please enter your full name.');
        isValid = false;
      }

      if (!validateEmail(email)) {
        showError('email-error', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!message) {
        showError('message-error', 'Please enter a message.');
        isValid = false;
      }

      if (!captchaToken) {
        showError('captcha-error', 'Captcha error.');
        isValid = false;
      }

      if (!termsAccepted) {
        showError('terms-error', 'Please accept the Terms & Conditions and Privacy Policy.');
        isValid = false;
      }

      if (!isValid) {
        hideLoadingOverlay();
        return;
      }

      const formData = {name: fullname, email, content: message, captchaToken};

      try {
        const response = await fetch('https://contact.vgravity.com/send', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          contactForm.reset();
          hideContactForm();
          showSuccessMessage();
        } else {
          showErrorMessage();
        }
      } catch (error) {
        showErrorMessage();
      } finally {
        // Hide loading overlay once the form submission is done (success or error)
        hideLoadingOverlay();
      }
    });
  }
})();