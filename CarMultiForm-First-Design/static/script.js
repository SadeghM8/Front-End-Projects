document.addEventListener('DOMContentLoaded', function () {
    let currentSlide = 0;
    let currentTrackingNumber = ''; // Variable to hold the tracking number
    const slides = document.querySelectorAll('.slide');
    const nextBtns = document.querySelectorAll('.nextBtn');
    const submitBtn = document.getElementById('submitButton');
    const prevBtns = document.querySelectorAll('.prevBtn');
    const tradeInField = document.getElementById('tradeInField');
    const tradeRadio = document.getElementById('trade');

    // Ensure only the first slide is visible at start
    slides.forEach((slide, index) => {
        slide.style.display = index === 0 ? 'block' : 'none';
    });

    // Go Next Slide and Validate the Form
    nextBtns.forEach(button => {
        button.addEventListener('click', function () {
            if (validateForm(currentSlide)) {
                submitForm(); // Save data before moving to the next slide
                nextSlide();
            }
        });
    });

    prevBtns.forEach(button => {
        button.addEventListener('click', prevSlide);
    });

    submitBtn.addEventListener('click', function () {
        if (validateForm(currentSlide)) {
            submitForm(true); // Final submission and send SMS
        }
    });

    // Show trade-in field if "Trade-in" option is selected
    tradeRadio.addEventListener('change', function () {
        tradeInField.style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('cash').addEventListener('change', function () {
        tradeInField.style.display = 'none';
    });

    document.getElementById('lease').addEventListener('change', function () {
        tradeInField.style.display = 'none';
    });

    function showSlide(n) {
        slides.forEach(slide => slide.style.display = 'none');
        slides[n].style.display = 'block';
    }

    function nextSlide() {
        currentSlide++;
        if (currentSlide >= slides.length) {
            currentSlide = slides.length - 1;
        }
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide--;
        if (currentSlide < 0) {
            currentSlide = 0;
        }
        showSlide(currentSlide);
    }

    function validateForm(slideIndex) {
        let isValid = true;
        const inputs = slides[slideIndex].querySelectorAll('input, select');

        clearErrors(slideIndex);

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                document.getElementById(`${input.id}Error`).textContent = `لطفاً ${input.previousElementSibling.textContent} را پر کنید`;
                isValid = false;
            }
            if (input.hasAttribute('pattern') && !new RegExp(input.getAttribute('pattern')).test(input.value)) {
                document.getElementById(`${input.id}Error`).textContent = `لطفاً ${input.previousElementSibling.textContent} معتبر وارد کنید`;
                isValid = false;
            }
        });

        if (slideIndex === 1 && document.querySelectorAll('#carModelGrid .selected').length === 0) {
            document.getElementById('carModelError').textContent = 'لطفاً حداقل یک مدل خودرو انتخاب کنید';
            isValid = false;
        }

        return isValid;
    }

    function clearErrors(slideIndex) {
        const errors = slides[slideIndex].querySelectorAll('.error');
        errors.forEach(error => error.textContent = '');
    }

    function submitForm(isFinalSubmission = false) {
        const formData = new FormData();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const mobileNumber = document.getElementById('mobileNumber').value; 
        const carBrand = document.querySelector('input[name="carBrand"]:checked')?.value || '';
        const buyingTermValue = document.querySelector('input[name="buyingTerm"]:checked');
        const buyingTermLabel = buyingTermValue ? buyingTermValue.nextElementSibling.textContent : ''; // Get the label
        // Collect UTM parameters from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || '';
        const utmMedium = urlParams.get('utm_medium') || '';
        const utmCampaign = urlParams.get('utm_campaign') || '';
        const utmTerm = urlParams.get('utm_term') || '';
        const utmContent = urlParams.get('utm_content') || '';

        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('mobileNumber', mobileNumber);
        formData.append('carBrand', carBrand);
        formData.append('carModels', getSelectedCarModels());
        formData.append('state', document.getElementById('state').value);
        formData.append('ssn', document.getElementById('ssn').value);
        formData.append('buyingTerm', buyingTermValue ? buyingTermValue.value : ''); // Keep the value for the database
        
        // Add UTM parameters
        formData.append('utm_source', utmSource);
        formData.append('utm_medium', utmMedium);
        formData.append('utm_campaign', utmCampaign);
        formData.append('utm_term', utmTerm);
        formData.append('utm_content', utmContent);

        // Only generate a new tracking number if it's the first submission
        if (!currentTrackingNumber) {
            currentTrackingNumber = generateTrackingNumber(); // Generate only once
        }
        formData.append('trackingNumber', currentTrackingNumber); // Include tracking number

        fetch('/static/index.html', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (isFinalSubmission) {
                    // Show success message and send SMS
                    document.querySelector('#multiForm').innerHTML = `
                        <div class="success-message">
                            <h3>${firstName} ${lastName} عزیز</h3>
                            <p>پیامک تایید برای شما ارسال شد. به زودی با شما تماس خواهیم گرفت.</p>
                            <p>شماره پیگیری شما: ${currentTrackingNumber}</p>
                        </div>
                    `;
                    const message = `سامانه خرید خودرو\n ${firstName} ${lastName} عزیز\nکد پیگیری شما: ${currentTrackingNumber}\nبرند خودرو: ${carBrand}\nنوع خرید: ${buyingTermLabel} \n  گروه خودرویی ستوده  \n 021-37682`; // Use the label in the message

                    sendSMS(mobileNumber, message);
                    
                    // Add a query parameter to the URL
                    const url = new URL(window.location.href);
                    url.searchParams.set('submissionStatus', 'success'); // Set your custom parameter
                    window.history.pushState({}, '', url); // Update the URL without reloading the page
                                
                }
            } else {
                // Handle error
                document.querySelector('#multiForm').innerHTML = `
                    <div class="error-message">
                        <h3>خطا در ثبت اطلاعات</h3>
                        <p>لطفا دوباره تلاش کنید.</p>
                    </div>
                `;
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function sendSMS(mobile, message) {
        fetch('/static/index.html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'mobile': mobile,
                'message': message
            })
        })
        .then(response => response.text())
        .then(result => {
            console.log('SMS sent successfully:', result);
        })
        .catch(error => {
            console.error('Error sending SMS:', error);
        });
    }

    function generateTrackingNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function getSelectedCarModels() {
        const selectedModels = [];
        document.querySelectorAll('#carModelGrid .selected').forEach(model => {
            selectedModels.push(model.querySelector('p').textContent);
        });
        return selectedModels.join(', ');
    }

    // Load car brands and models from CSV
    Papa.parse("../ajax/papaparse.min.js", {
        download: true,
        header: true,
        encoding: "UTF-8", 
        complete: function (results) {
            const carData = results.data;
            const carBrandContainer = document.getElementById('carBrand');
            const carModelsContainer = document.getElementById('carModelGrid');
            const brands = {};

            // Group car models by brand
            carData.forEach(car => {
                if (!brands[car.Brand]) {
                    brands[car.Brand] = [];
                }
                brands[car.Brand].push(car);
            });

            // Render car brands as radio buttons
            for (const brand in brands) {
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = 'carBrand';
                radioInput.value = brand;
                radioInput.id = brand.toLowerCase();

                const label = document.createElement('label');
                label.setAttribute('for', brand.toLowerCase());
                label.textContent = brand;

                carBrandContainer.appendChild(radioInput);
                carBrandContainer.appendChild(label);

                // Add event listener to display models when a brand is selected
                radioInput.addEventListener('change', () => {
                    carModelsContainer.innerHTML = ''; // Clear previous models
                    brands[brand].forEach(car => {
                        const carItem = document.createElement('div');
                        carItem.classList.add('carItem');
                        carItem.innerHTML = `
                            <div class="carBox">
                                <a href="${car.DetailURL}" class="info-icon" target="_blank" title="اطلاعات کامل خودرو">ℹ️</a>
                                <img src="../images/cars/${car.Image}" alt="${car.Model}">
                                <p>${car.Model}</p>
                                <p>${car.Price}</p>
                            </div>
                        `;

                        carItem.addEventListener('click', function () {
                            carItem.classList.toggle('selected');
                        });

                        carModelsContainer.appendChild(carItem);
                    });
                });
            }
        }
    });
});




  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SKHVJE0F8Y');


  
!function (t, e, n) {
    t.yektanetAnalyticsObject = n, t[n] = t[n] || function () {
        t[n].q.push(arguments)
    }, t[n].q = t[n].q || [];
    var a = new Date, r = a.getFullYear().toString() + "0" + a.getMonth() + "0" + a.getDate() + "0" + a.getHours(),
        c = e.getElementsByTagName("script")[0], s = e.createElement("script");
    s.id = "ua-script-olGDq07i"; s.dataset.analyticsobject = n;
    s.async = 1; s.type = "text/javascript";
    s.src = "../rg_woebegone/rg.complete.js" + r, c.parentNode.insertBefore(s, c)
}(window, document, "yektanet");
