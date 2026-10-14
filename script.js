document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. THEME TOGGLE ENGINE (Supports Desktop & Mobile Buttons)
       ========================================================================== */
    const themeToggleBtns = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved theme preference or system setting
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        htmlElement.classList.add('dark');
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcons('dark');
    } else {
        htmlElement.classList.remove('dark');
        htmlElement.setAttribute('data-theme', 'light');
        updateThemeIcons('light');
    }

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isDark = htmlElement.classList.contains('dark');
            if (isDark) {
                htmlElement.classList.remove('dark');
                htmlElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                updateThemeIcons('light');
            } else {
                htmlElement.classList.add('dark');
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeIcons('dark');
            }
        });
    });

    function updateThemeIcons(theme) {
        const themeIcons = document.querySelectorAll('#theme-icon, #mobile-theme-toggle i');
        themeIcons.forEach(icon => {
            if (theme === 'dark') {
                icon.className = 'fa-solid fa-sun text-amber-400';
            } else {
                icon.className = 'fa-solid fa-moon text-excel-500';
            }
        });
    }

    /* ==========================================================================
       2. MOBILE MENU DRAWER & LINK AUTO-CLOSE
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Auto-close menu when a navigation link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    /* ==========================================================================
       3. SCROLL PROGRESS BAR & ANIMATIONS
       ========================================================================== */
    const progressBar = document.getElementById('scroll-progress');
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    window.addEventListener('scroll', () => {
        // Scroll Progress
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        }

        // Scroll Reveal Animation
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top <= windowHeight * 0.85) {
                el.classList.add('visible');
            }
        });
    }, { passive: true });

    // Initial check for elements in view on load
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.85) {
            el.classList.add('visible');
        }
    });

    /* ==========================================================================
       4. ANIMATED COUNTERS (For Impact Metrics Section)
       ========================================================================== */
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 1500; // 1.5 seconds
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.ceil(current);
                }
            }, stepTime);
        });
    }

    // Trigger counters when metrics section becomes visible
    const metricsSection = document.getElementById('metrics');
    if (metricsSection) {
        window.addEventListener('scroll', () => {
            const rect = metricsSection.getBoundingClientRect();
            if (rect.top <= window.innerHeight && !animated) {
                animateCounters();
                animated = true;
            }
        }, { passive: true });
    }

    /* ==========================================================================
       5. MODAL SYSTEM & BODY SCROLL-LOCK
       ========================================================================== */
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalTriggers = document.querySelectorAll('.modal-trigger, .preview-trigger');
    const modalCloseBtns = document.querySelectorAll('.modal-close');

    if (modalBackdrop) {
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.getAttribute('data-modal');
                const title = trigger.getAttribute('data-title');
                const template = trigger.getAttribute('data-template');

                // Dynamic preview content rendering for solutions page
                const dynamicContent = document.getElementById('modal-content');
                if (dynamicContent && title) {
                    dynamicContent.innerHTML = `
                        <span class="px-3 py-1 rounded-full bg-excel-500/10 text-excel-500 text-xs font-semibold">Asset Preview</span>
                        <h3 class="text-xl sm:text-2xl font-bold mt-3 mb-2">${title}</h3>
                        <p class="text-sm text-secondary-custom mb-4">Detailed preview and specification details for template: <code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">${template}</code></p>
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs sm:text-sm space-y-2 text-secondary-custom">
                            <p><strong>Status:</strong> Ready for Deployment / Instant Download</p>
                            <p><strong>Format:</strong> .xlsx, .m, or HTML/Tailwind Archive</p>
                            <p><strong>Support:</strong> Complete setup instructions included</p>
                        </div>
                    `;
                }

                // Show target modal
                if (modalId) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) targetModal.classList.remove('hidden');
                }

                modalBackdrop.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Lock background scrolling
            });
        });

        const closeModal = () => {
            modalBackdrop.classList.add('hidden');
            document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));
            document.body.style.overflow = ''; // Restore background scrolling
        };

        modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
    }

    /* ==========================================================================
       6. FILTERING SYSTEMS (Skills & Solutions Store)
       ========================================================================== */
    // Skill Filter (index.html)
    const skillFilterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    skillFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            skillFilterBtns.forEach(b => {
                b.classList.remove('bg-excel-600', 'text-white', 'shadow-md');
                b.classList.add('border', 'border-slate-700');
            });
            btn.classList.add('bg-excel-600', 'text-white', 'shadow-md');
            btn.classList.remove('border', 'border-slate-700');

            skillCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Store Category Filter (solutions.html)
    const storeFilterBtns = document.querySelectorAll('.filter-btn');
    const storeCards = document.querySelectorAll('.offering-card');

    storeFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            storeFilterBtns.forEach(b => {
                b.classList.remove('bg-excel-600', 'text-white', 'shadow-md');
                b.classList.add('border', 'border-slate-700');
            });
            btn.classList.add('bg-excel-600', 'text-white', 'shadow-md');
            btn.classList.remove('border', 'border-slate-700');

            storeCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ==========================================================================
       7. FAQ TOGGLE ACCORDION
       ========================================================================== */
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            const icon = document.getElementById(`faq-icon-${targetId}`);

            if (targetContent) {
                const isHidden = targetContent.classList.contains('hidden');
                targetContent.classList.toggle('hidden');
                if (icon) {
                    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });

    /* ==========================================================================
       8. CONTACT FORM SUBMISSION TOAST NOTIFICATION
       ========================================================================== */
    const contactForms = document.querySelectorAll('#contact-form');
    const toast = document.getElementById('toast');

    contactForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (toast) {
                setTimeout(() => {
                    toast.classList.remove('translate-y-32');
                    setTimeout(() => {
                        toast.classList.add('translate-y-32');
                    }, 4000);
                }, 500);
            }
        });
    });
});