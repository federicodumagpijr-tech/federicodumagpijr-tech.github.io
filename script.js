document.addEventListener('DOMContentLoaded', () => {
    // Scroll Progress Bar
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) progressBar.style.width = scrolled + '%';
    });

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const mobileThemeIcon = mobileThemeToggle ? mobileThemeToggle.querySelector('i') : null;
    const htmlElement = document.documentElement;

    function toggleTheme() {
        if (htmlElement.getAttribute('data-theme') === 'dark') {
            htmlElement.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-excel-500';
            if (mobileThemeIcon) mobileThemeIcon.className = 'fa-solid fa-moon text-excel-500';
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-excel-500';
            if (mobileThemeIcon) mobileThemeIcon.className = 'fa-solid fa-sun text-excel-500';
        }
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // Scroll Reveal Observer
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (entry.target.querySelector('.counter')) {
                    startCounters();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    // Animated Counters
    let countersStarted = false;
    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;
        document.querySelectorAll('.counter').forEach(counter => {
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

    // Skill Filter Engine
    const filterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.classList.remove('bg-excel-600', 'text-white', 'shadow-md');
                    b.classList.add('border', 'border-slate-700');
                });
                btn.classList.add('bg-excel-600', 'text-white', 'shadow-md');
                btn.classList.remove('border', 'border-slate-700');

                const filter = btn.getAttribute('data-filter');
                skillCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Category Filter Navigation (Solutions Page)
    window.filterCategory = function(category) {
        const sections = document.querySelectorAll('.category-section');
        const catFilterBtns = document.querySelectorAll('.filter-btn');

        catFilterBtns.forEach(btn => {
            btn.classList.remove('bg-excel-600', 'text-white', 'shadow-md');
            btn.classList.add('border', 'border-slate-700');
        });

        const targetBtn = document.getElementById(`btn-${category}`);
        if (targetBtn) {
            targetBtn.classList.remove('border', 'border-slate-700');
            targetBtn.classList.add('bg-excel-600', 'text-white', 'shadow-md');
        }

        sections.forEach(section => {
            if (category === 'all') {
                section.classList.remove('hidden');
            } else {
                if (section.id === `section-${category}`) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            }
        });
    };

    // FAQ Accordion Toggle
    window.toggleFaq = function(id) {
        const content = document.getElementById(id);
        const icon = document.getElementById(`faq-icon-${id}`);
        if (content && icon) {
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.classList.add('rotate-180');
            } else {
                content.classList.add('hidden');
                icon.classList.remove('rotate-180');
            }
        }
    };

    // Modal System
    const modalBackdrop = document.getElementById('modal-backdrop');
    window.openModal = function(modalId) {
        if (modalBackdrop) {
            modalBackdrop.classList.remove('hidden');
            document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));
            const targetModal = document.getElementById(modalId);
            if (targetModal) targetModal.classList.remove('hidden');
        }
    };

    window.closeModal = function() {
        if (modalBackdrop) {
            modalBackdrop.classList.add('hidden');
            document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));
        }
    };

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) window.closeModal();
        });
    }

    // Solutions Preview Modal Data
    const modalData = {
        'excel-unifier': {
            title: 'Multi-Source CSV Unifier Preview',
            desc: 'This tool connects directly to a folder containing weekly CSV exports. As new files are added, clicking "Refresh" automatically appends, cleans headers, and formats the output.',
            highlights: ['Zero custom VBA required', 'Built purely with native M-Code', 'Handles 100,000+ rows seamlessly']
        },
        'excel-payroll': {
            title: 'Payroll Reconciliation Model Preview',
            desc: 'Includes dynamic match indicators that highlight variances in red, matching keys in green, and missing records in yellow.',
            highlights: ['Dual-key identification logic', 'Audit trail output tab', 'Clean printable summary format']
        },
        'web-portfolio': {
            title: 'Tech Portfolio Template Blueprint',
            desc: 'Live interactive layout built with responsive Tailwind CSS components, sticky headers, dark/light theme options, and custom CTA triggers.',
            highlights: ['100% Mobile Responsive', 'Professional Static Hosting & Deployment', 'No backend needed']
        },
        'sop-reporting': {
            title: 'M365 Automated Reporting Blueprint Preview',
            desc: 'Includes downloadable Power Automate flow package that triggers automatically when a Microsoft Form is submitted.',
            highlights: ['JSON import file included', 'Step-by-step visual map', 'Automated email alerts']
        },
        'sop-audit': {
            title: 'Data Audit Checklist Preview',
            desc: 'A robust standard checklist to catch duplicates, leading whitespace errors, corrupted dates, and illegal characters before data processing.',
            highlights: ['Printable & digital version', 'Pre-formatted Excel sheet', 'Includes validation rules']
        }
    };

    window.openPreviewModal = function(title, key) {
        const contentContainer = document.getElementById('modal-content');
        if (!contentContainer) return;
        const data = modalData[key] || {
            title: title,
            desc: 'Sample item details and workflow demonstration.',
            highlights: ['Instant Download', 'Full Documentation Included']
        };

        contentContainer.innerHTML = `
            <div class="flex items-center space-x-3 mb-4">
                <div class="w-9 h-9 rounded-lg bg-excel-500/10 text-excel-500 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h3 class="text-lg font-bold">${data.title}</h3>
            </div>
            <p class="text-xs sm:text-sm opacity-80 leading-relaxed mb-4">${data.desc}</p>
            <div class="p-4 rounded-xl border mb-6">
                <div class="text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Key Highlights</div>
                <ul class="space-y-1.5 text-xs sm:text-sm opacity-90">
                    ${data.highlights.map(h => `<li class="flex items-center"><i class="fa-solid fa-check text-excel-500 mr-2"></i> ${h}</li>`).join('')}
                </ul>
            </div>
            <div class="flex justify-end">
                <button onclick="closeModal()" class="px-4 py-2 bg-excel-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-excel-700 transition-colors">
                    Close Preview
                </button>
            </div>
        `;
        if (modalBackdrop) modalBackdrop.classList.remove('hidden');
    };

    // Form Handling & Toast
    window.handleFormSubmit = function(e) {
        e.preventDefault();
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.remove('translate-y-32');
            setTimeout(() => {
                toast.classList.add('translate-y-32');
            }, 4000);
        }
        if (e.target && typeof e.target.reset === 'function') {
            e.target.reset();
        }
    };
});
