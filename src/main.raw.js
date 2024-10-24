import './styles.raw.css';

document.addEventListener('DOMContentLoaded', function () {
  (function () {
    'use strict';

    const elements = {
      dropdownButton: document.querySelector('.dropdown-button'),
      dropdownItems: document.querySelectorAll('.dropdown-item'),
      dropdown: document.querySelector('.services-mobile-dropdown'),
      tabs: document.querySelectorAll('.tab'),
      serviceDescriptions: document.querySelectorAll('.service-description'),
      contactSubmitButton: document.getElementById('contact-form-submit'),
      captchaTokenInput: document.getElementById('captchaToken'),
      currentYearElement: document.getElementById('current-year'),
      contactForm: document.querySelector('.contact-form'),
      fullnameInput: document.getElementById('fullname'),
      emailInput: document.getElementById('email'),
      messageInput: document.getElementById('message'),
      termsCheckbox: document.getElementById('terms'),
      loadingOverlay: document.getElementById('loading-overlay'),
      successMessage: document.getElementById('success-message'),
      errorMessageContainer: document.getElementById('error-message'),
      mobileNav: document.querySelector('nav.mobile-nav'),
      menuLinks: document.querySelectorAll('nav.mobile-nav ul a'),
      contactFormErrorMessages: document.querySelectorAll('.error-message'),
      contactFormError: document.querySelectorAll('.error'),
      header: document.querySelector('header'),
      mobileMenu: document.getElementById('mobile-menu'),
      closeMenu: document.getElementById('close-menu')
    };

    // Set current year
    if (elements.currentYearElement) {
      elements.currentYearElement.textContent = new Date().getFullYear().toString();
    }

    // Header scroll behavior
    let lastScrollPosition = 0;
    const headerHeight = 96;

    window.addEventListener('scroll', throttle(() => {
      let currentScrollPosition = window.scrollY;
      elements.header.classList.toggle('hide-header', currentScrollPosition > lastScrollPosition && currentScrollPosition > headerHeight);
      lastScrollPosition = currentScrollPosition;
    }, 100));

    // Captcha related logic
    if (elements.contactSubmitButton) {
      elements.contactSubmitButton.disabled = true;
    }

    if (elements.contactSubmitButton && elements.captchaTokenInput) {
      window.CFTurnstilCallback = function (token) {
        elements.contactSubmitButton.disabled = false;
        elements.captchaTokenInput.value = token;
      };

      window.CFTurnstilReset = function () {
        elements.contactSubmitButton.disabled = true;
        elements.captchaTokenInput.value = '';
      };
    }

    // Mobile navigation
    if (elements.mobileMenu) {
      elements.mobileMenu.addEventListener('click', toggleMobileNav);
    }

    if (elements.closeMenu) {
      elements.closeMenu.addEventListener('click', toggleMobileNav);
    }

    if (elements.menuLinks) {
      elements.menuLinks.forEach(link => {
        link.addEventListener('click', toggleMobileNav);
      });
    }

    function toggleMobileNav() {
      elements.mobileNav.classList.toggle('active');
      toggleBodyScroll();
    }

    // Dropdown behavior
    if (elements.dropdownButton && elements.dropdown) {
      elements.dropdownButton.addEventListener('click', () => {
        elements.dropdown.classList.toggle('active');
      });
    }

    if (elements.dropdownItems) {
      elements.dropdownItems.forEach(item => {
        item.addEventListener('click', event => {
          const selectedValue = event.target.getAttribute('data-key');
          updateDisplayedContent(selectedValue);
          elements.dropdown.classList.remove('active');
          elements.dropdownButton.textContent = event.target.textContent;
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (elements.dropdown && !elements.dropdown.contains(e.target)) {
        elements.dropdown.classList.remove('active');
      }
    });

    // Tabs behavior
    if (elements.tabs) {
      elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          elements.tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const selectedValue = tab.getAttribute('data-key');
          updateDisplayedContent(selectedValue);
        });
      });
    }

    // Contact form submission
    if (elements.contactForm) {
      elements.contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        clearErrors();
        hideElement(elements.errorMessageContainer);
        showElement(elements.loadingOverlay);

        const formData = {
          name: elements.fullnameInput?.value.trim(),
          email: elements.emailInput?.value.trim(),
          content: elements.messageInput?.value.trim(),
          captchaToken: elements.captchaTokenInput?.value.trim(),
        };

        if (!validateForm(formData)) {
          hideElement(elements.loadingOverlay);
          return;
        }

        try {
          const response = await sendFormData(formData);
          if (response.ok) {
            elements.contactForm.reset();
            hideElement(elements.contactForm);
            showElement(elements.successMessage);
          } else {
            showElement(elements.errorMessageContainer);
          }
        } catch {
          showElement(elements.errorMessageContainer);
        } finally {
          hideElement(elements.loadingOverlay);
        }
      });
    }

    // Helper functions
    function toggleBodyScroll() {
      document.body.style.overflow = elements.mobileNav.classList.contains('active') ? 'hidden' : '';
    }

    function updateDisplayedContent(selectedValue) {
      elements.serviceDescriptions.forEach(description => {
        description.style.display = description.getAttribute('data-key') === selectedValue ? 'block' : 'none';
      });
    }

    function validateForm(formData) {
      let isValid = true;

      if (!formData.name) {
        showError('fullname-error', 'Please enter your full name.');
        isValid = false;
      }

      if (!validateEmail(formData.email)) {
        showError('email-error', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!formData.content) {
        showError('message-error', 'Please enter a message.');
        isValid = false;
      }

      if (!formData.captchaToken) {
        showError('captcha-error', 'Captcha error.');
        isValid = false;
      }

      if (!elements.termsCheckbox.checked) {
        showError('terms-error', 'Please accept the Terms & Conditions and Privacy Policy.');
        isValid = false;
      }

      return isValid;
    }

    async function sendFormData(formData) {
      return await fetch('https://contact.vgravity.com/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
    }

    function showError(elementId, message) {
      const errorElement = document.getElementById(elementId);
      if (errorElement) {
        errorElement.textContent = message;
        showElement(errorElement);
        errorElement.previousElementSibling?.classList.add('error');
      }
    }

    function clearErrors() {
      elements.contactFormErrorMessages.forEach(hideElement);
      elements.contactFormError.forEach(element => element.classList.remove('error'));
    }

    function validateEmail(email) {
      const re = /^\S+@\S+\.\S+$/;
      return re.test(email);
    }

    function showElement(element) {
      element && (element.style.display = 'block');
    }

    function hideElement(element) {
      element && (element.style.display = 'none');
    }

    // Throttle function to optimize scroll performance
    function throttle(fn, limit) {
      let lastCall = 0;
      return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
          lastCall = now;
          fn(...args);
        }
      };
    }
  })();
});
