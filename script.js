function init() {
    // Theme Toggle Functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    
    // Apply saved theme or default to dark
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        // Default is dark mode
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    if (themeToggleBtn) {
        // Remove existing listeners to avoid duplicates if re-initialized (though init runs once)
        const newBtn = themeToggleBtn.cloneNode(true);
        themeToggleBtn.parentNode.replaceChild(newBtn, themeToggleBtn);
        
        newBtn.addEventListener('click', () => {
            // Add rotation animation class
            newBtn.classList.add('switching');
            
            // Wait for half of animation to switch theme (smooth transition)
            setTimeout(() => {
                const currentTheme = htmlElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                htmlElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
            }, 150);

            // Remove animation class after transition
            setTimeout(() => {
                newBtn.classList.remove('switching');
            }, 500);
        });
    }

    function updateThemeIcon(theme) {
        // Get fresh reference if needed
        const btn = document.getElementById('theme-toggle');
        const icon = btn ? btn.querySelector('i') : null;
        if (!icon) return;
        
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        // Clone to remove old listeners
        const newHamburger = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        
        newHamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            newHamburger.classList.toggle('active');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                newHamburger.classList.remove('active');
            });
        });
    }

    // Page Transition
    const transitionOverlay = document.querySelector('.page-transition');
    
    if (transitionOverlay) {
        // Ensure visible initially for fade out
        transitionOverlay.style.display = 'block';
        transitionOverlay.style.opacity = '1';
        
        // Force reflow
        void transitionOverlay.offsetWidth;

        setTimeout(() => {
            transitionOverlay.style.opacity = '0';
            setTimeout(() => {
                transitionOverlay.style.display = 'none';
            }, 400);
        }, 100);
    }

    // Intercept clicks for transition
    document.querySelectorAll('a').forEach(anchor => {
        // Check if listener already attached? Hard to check.
        // But re-adding is fine if we are careful. 
        // Better to not re-add if not needed.
        // Assuming init runs once.
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('http')) {
                e.preventDefault();
                
                if (transitionOverlay) {
                    transitionOverlay.style.display = 'block';
                    void transitionOverlay.offsetWidth;
                    transitionOverlay.style.opacity = '1';
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 400);
                } else {
                    window.location.href = href;
                }
            }
        });
    });

    // Smooth Scrolling with Offset for Fixed Header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });

    // Copy to Clipboard Functionality
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-text');
            navigator.clipboard.writeText(textToCopy).then(() => {
                const tooltip = btn.querySelector('.tooltip');
                if(tooltip) tooltip.innerText = "已复制!";
                btn.classList.add('copied');
                
                setTimeout(() => {
                    if(tooltip) tooltip.innerText = "点击复制";
                    btn.classList.remove('copied');
                }, 2000);
                
                showToast(`已复制: ${textToCopy}`);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showToast('复制失败，请重试');
            });
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Toast Notification (Global)
function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
