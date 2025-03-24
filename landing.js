// Fixed JavaScript for mobile menu
document.addEventListener('DOMContentLoaded', function() {
    // Store the original content
    const mainContent = document.querySelector('.content-wrapper');
    const body = document.body;
    
    // Initially hide all content and prevent scroll
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.visibility = 'hidden';
        body.classList.add('loading');
    }

    // Loading animation
    const preloader = document.querySelector('.preloader');
    const progressBar = document.querySelector('.progress-bar');
    const maxLoadTime = 2000; // 2 seconds
    const startTime = Date.now();

    let progress = 0;
    const interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        progress = Math.min((elapsedTime / maxLoadTime) * 100, 100);
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progress === 100) {
            clearInterval(interval);
            completeLoading();
        }
    }, 50);

    function completeLoading() {
        // Fade out preloader
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                
                // Show content with fade in
                if (mainContent) {
                    mainContent.style.visibility = 'visible';
                    mainContent.style.opacity = '1';
                }
                
                // Enable scrolling
                body.classList.remove('loading');
                
                // Initialize other features after content is visible
                initializeNavigation();
                initializeScrollEffects();
            }, 300);
        }
    }

    // Force complete if taking too long
    setTimeout(() => {
        clearInterval(interval);
        completeLoading();
    }, maxLoadTime + 500);

    const menuIcon = document.querySelector('.menu-icon');
    const navItems = document.querySelector('.nav-items');
    const menuIconBtn = menuIcon.querySelector('i');

    // Toggle menu
    menuIcon?.addEventListener('click', () => {
        navItems.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navItems.contains(e.target) && !menuIcon.contains(e.target)) {
            navItems.classList.remove('active');
        }
    });

    // Close menu when window is resized to desktop view
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navItems.classList.remove('active');
        }
    });

    // Handle nav link clicks
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Close mobile menu
            navItems.classList.remove('active');
            menuIconBtn.classList.replace('fa-times', 'fa-bars');
        });
    });

    // Smooth scroll functionality
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navItems.classList.contains('active')) {
                navItems.classList.remove('active');
            }

            // Get the target element
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                // Smooth scroll with animation
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active state
                updateActiveLink(this.getAttribute('href'));
            }
        });
    });

    // Update active link on scroll
    function updateActiveLink(hash = null) {
        const scrollPosition = window.scrollY;

        // Get all sections
        const sections = document.querySelectorAll('section, .hero');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Adjust offset as needed
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id || 'home';
            }
        });

        // Update active class
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').replace('#', '');
            if (href === currentSection || (href === '' && currentSection === 'home')) {
                link.classList.add('active');
            }
        });
    }

    // Listen for scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            updateActiveLink();
        }, 100); // Throttle scroll events
    });

    // Initial active state
    updateActiveLink();

    // Add scroll-to-top button functionality
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.className = 'scroll-to-top';
    document.body.appendChild(scrollButton);

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    // Add this to handle page transitions
    window.addEventListener('beforeunload', function() {
        document.querySelector('.preloader').classList.remove('fade-out');
        document.querySelector('.content-wrapper').classList.remove('loaded');
    });
}); 