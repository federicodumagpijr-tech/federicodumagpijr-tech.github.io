document.addEventListener('DOMContentLoaded', () => {
    // Scroll Progress Bar
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Theme Toggle (Supports both main & mobile theme buttons)
    const themeToggles = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
    const themeIcons = document.querySelectorAll('#theme-icon');
    const htmlElement = document.documentElement;

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                htmlElement.setAttribute('data-theme', 'light');
                themeIcons.forEach(icon => icon.className = 'fa-solid fa-moon');
            } else {
                htmlElement.classList.add('dark');
                htmlElement.setAttribute('data-theme', 'dark');
                themeIcons.forEach(icon => icon.className = 'fa-solid fa-sun');
            }
        });
    });

    // Counter Animation (Index page)
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    function runCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const speed = target / 50;
            const updateCount = () => {
                count += speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCount, 30);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    window.addEventListener('scroll', () => {
        const metricsSection = document.getElementById('metrics');
        if (metricsSection && !animated) {
            const rect = metricsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                runCounters();
                animated = true;
            }
        }
    });

    // Skill & Solution Category Filtering (Unified)
    const filterButtons = document.querySelectorAll('.skill-filter-btn, .filter-btn');
    const filterableCards = document.querySelectorAll('.skill-card, .offering-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-excel-600', 'text-white', 'shadow-md');
                btn.classList.add('border', 'border-slate-700');
            });
            button.classList.add('bg-excel-600', 'text-white', 'shadow-md');
            button.classList.remove('border', 'border-slate-700');

            const filter = button.getAttribute('data-filter');
            filterableCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Modal System (Index & Solutions Previews)
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const previewTriggers = document.querySelectorAll('.preview-trigger');
    const modalCloseButtons = document.querySelectorAll('.modal-close');

    function openModalById(modalId) {
        if (modalBackdrop) {
            modalBackdrop.classList.remove('hidden');
            const modalContent = document.getElementById(modalId);
            if (modalContent) {
                modalContent.classList.remove('hidden');
            }
        }
    }

    function closeModal() {
        if (modalBackdrop) {
            modalBackdrop.classList.add('hidden');
            const modalContents = document.querySelectorAll('.modal-content');
            modalContents.forEach(content => content.classList.add('hidden'));
            const dynamicModalContent = document.getElementById('modal-content');
            if (dynamicModalContent) {
                dynamicModalContent.innerHTML = '';
            }
        }
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal');
            openModalById(modalId);
        });
    });

    previewTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const title = trigger.getAttribute('data-title');
            const template = trigger.getAttribute('data-template');
            const dynamicModalContent = document.getElementById('modal-content');
            if (modalBackdrop && dynamicModalContent) {
                dynamicModalContent.innerHTML = `
                    <span class="px-3 py-1 rounded-full bg-excel-500/10 text-excel-500 text-xs font-semibold">Solution Preview</span>
                    <h3 class="text-2xl font-bold mt-4 mb-3">${title}</h3>
                    <p class="text-sm sm:text-base text-secondary-custom mb-4">This preview showcases the production-ready architecture for <strong>${title}</strong> (${template}). Designed for seamless deployment, high data integrity, and automated performance.</p>
                    <div class="space-y-2 text-sm text-secondary-custom border-t pt-4">
                        <div class="flex items-center space-x-2"><i class="fa-solid fa-check text-excel-500"></i><span>Fully tested M-code & modular structure</span></div>
                        <div class="flex items-center space-x-2"><i class="fa-solid fa-check text-excel-500"></i><span>Instant digital download upon purchase</span></div>
                    </div>
                `;
                modalBackdrop.classList.remove('hidden');
            }
        });
    });

    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }

    // FAQ Accordion Toggle (Solutions page)
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            const icon = document.getElementById(`faq-icon-${targetId}`);
            if (targetContent) {
                targetContent.classList.toggle('hidden');
                if (icon) {
                    icon.classList.toggle('rotate-180');
                }
            }
        });
    });

    // Form Submit Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    showToast();
                    contactForm.reset();
                } else {
                    alert('There was a problem submitting your form.');
                }
            }).catch(() => {
                alert('There was a problem submitting your form.');
            });
        });
    }

    function showToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.remove('translate-y-32');
            setTimeout(() => {
                toast.classList.add('translate-y-32');
            }, 4000);
        }
    }

    // Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
});