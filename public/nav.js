document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    // Get the name of the current file (e.g., "create.html")
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        link.classList.remove('active'); // Remove active from all

        // Check if it's the homepage
        if ((currentPath === '' || currentPath === 'index.html') && linkPath === 'index.html') {
            link.classList.add('active');
        }
        // Check for other pages
        else if (currentPath === linkPath) {
            link.classList.add('active');
        }
    });
});