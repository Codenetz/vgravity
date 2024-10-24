import './styles.raw.css';

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const dropdown = document.querySelector('.services-mobile-dropdown');
  const tabs = document.querySelectorAll('.tab');
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
  const mobileNav = document.querySelector('nav.mobile-nav');
  const menuLinks = document.querySelectorAll('nav.mobile-nav ul a');
  const contactFormErrorMessages = document.querySelectorAll('.error-message');
  const contactFormError = document.querySelectorAll('.error');
  const header = document.querySelector('header');

  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear().toString();
  }

  let lastScrollPosition = 0;
  const headerHeight = 96;

  window.addEventListener('scroll', function () {
    let currentScrollPosition = window.scrollY;

    if (currentScrollPosition > lastScrollPosition && currentScrollPosition > headerHeight) {
      header.classList.add('hide-header');
    } else if (currentScrollPosition < lastScrollPosition) {
      header.classList.remove('hide-header');
    }

    lastScrollPosition = currentScrollPosition;
  });

  // Captcha
  if (contactSubmitButton) {
    contactSubmitButton.disabled = true;
  }

  window.CFTurnstilCallback = function (token) {
    if (contactSubmitButton) contactSubmitButton.disabled = false;
    if (captchaTokenInput) captchaTokenInput.value = token;
  };

  window.CFTurnstilReset = function () {
    if (contactSubmitButton) contactSubmitButton.disabled = true;
    if (captchaTokenInput) captchaTokenInput.value = '';
  };

  // Mobile navigation
  document.getElementById('mobile-menu').addEventListener('click', function () {
    mobileNav.classList.toggle('active');
    toggleBodyScroll();
  });

  document.getElementById('mobile-menu').addEventListener('touchend', function () {
    mobileNav.classList.toggle('active');
    toggleBodyScroll();
  });

  document.getElementById('close-menu').addEventListener('click', function () {
    mobileNav.classList.toggle('active');
    toggleBodyScroll();
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', function () {
      mobileNav.classList.toggle('active');
      toggleBodyScroll();
    });
  });

  // Service dropdown
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

  // Contact form
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
        return;
      }

      showErrorMessage();
    } catch (error) {
      showErrorMessage();
    } finally {
      hideLoadingOverlay();
    }
  });

  // Used from contact form
  function showSuccessMessage() {
    if (successMessage) {
      successMessage.style.display = 'block';
    }
  }

  // Used from contact form
  function hideContactForm() {
    if (contactForm) {
      contactForm.style.display = 'none';
    }
  }

  // Used from contact form
  function showLoadingOverlay() {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
    }
  }

  // Used from contact form
  function hideLoadingOverlay() {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  // Used from contact form
  function showErrorMessage() {
    if (errorMessageContainer) {
      errorMessageContainer.style.display = 'block';
    }
  }

  // Used from contact form
  function hideErrorMessage() {
    if (errorMessageContainer) {
      errorMessageContainer.style.display = 'none';
    }
  }

  // Used from contact form
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      const inputElement = errorElement.previousElementSibling;
      if (inputElement) inputElement.classList.add('error');
    }
  }

  // Used from contact form
  function clearErrors() {
    contactFormErrorMessages.forEach(element => {
      element.style.display = 'none';
    });

    contactFormError.forEach(element => {
      element.classList.remove('error');
    });
  }

  // Used from contact form
  function validateEmail(email) {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  }

  // Used from navigation
  function toggleBodyScroll() {
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  }

  // Used from service section
  function updateDisplayedContent(selectedValue) {
    serviceDescriptions.forEach(description => {
      description.style.display = description.getAttribute('data-key') === selectedValue ? 'block' : 'none';
    });
  }
});