document.addEventListener('DOMContentLoaded', () => {
    // Navigation highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        link.classList.remove('active'); 

        if ((currentPath === '' || currentPath === 'index.html') && linkPath === 'index.html') {
            link.classList.add('active');
        }
        else if (currentPath === linkPath) {
            link.classList.add('active');
        }
    });

    // Dark Mode Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        };

        // Init theme
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (prefersDark) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }

        // Toggle on click
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Ensure Created Count gets updated anywhere it exists
    const countDisplay = document.getElementById('created-count');
    if (countDisplay) {
        const savedCount = localStorage.getItem('cert_count') || 0;
        
        // Simple counter animation
        let current = 0;
        const target = parseInt(savedCount, 10);
        if(target > 0) {
            const increment = Math.ceil(target / 20);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                countDisplay.textContent = current;
            }, 30);
        } else {
            countDisplay.textContent = "0";
        }
    }
});