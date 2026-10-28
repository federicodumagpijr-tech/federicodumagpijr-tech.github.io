/**
 * LIQUID CRYSTAL INTERACTION SYSTEM
 * Supports: Mouse Specular Refraction Physics, Unobtrusive Category Filtering,
 * Navigation Sync, Scroll Progress, and Form Submission Toast.
 */
document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. LIQUID CRYSTAL SPECULAR CAUSTIC SHEEN (MOUSE INTERACTION)
     ========================================================================== */
  const sheenPanels = document.querySelectorAll(".crystal-sheen");

  sheenPanels.forEach((panel) => {
    panel.addEventListener("mousemove", (e) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty("--mouse-x", `${x}px`);
      panel.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  /* ==========================================================================
     2. MOBILE MENU DRAWER & LINK AUTO-CLOSE
     ========================================================================== */
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  /* ==========================================================================
     3. PRISMATIC SCROLL PROGRESS & REVEAL ANIMATIONS
     ========================================================================== */
  const progressBar = document.getElementById("scroll-progress");
  const revealElements = document.querySelectorAll(".reveal-on-scroll");

  const handleScroll = () => {
    if (progressBar) {
      const winScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + "%";
    }

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= windowHeight * 0.88) {
        el.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // Trigger initial view check

  /* ==========================================================================
     4. UNOBTRUSIVE STORE CATEGORY FILTERING (ZERO INLINE JS)
     ========================================================================== */
  const filterButtons = document.querySelectorAll("[data-filter-category]");
  const storeItems = document.querySelectorAll(".store-item");

  function applyCategoryFilter(selectedCategory) {
    filterButtons.forEach((btn) => {
      if (btn.getAttribute("data-filter-category") === selectedCategory) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    storeItems.forEach((item) => {
      if (
        selectedCategory === "all" ||
        item.classList.contains(`category-${selectedCategory}`)
      ) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });

    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const category = button.getAttribute("data-filter-category");
      applyCategoryFilter(category);
    });
  });

  /* ==========================================================================
     5. CONTACT FORM SUBMISSION TOAST NOTIFICATION
     ========================================================================== */
  const contactForms = document.querySelectorAll("#contact-form");
  const toast = document.getElementById("toast");

  contactForms.forEach((form) => {
    form.addEventListener("submit", () => {
      if (toast) {
        setTimeout(() => {
          toast.classList.add("toast-active");
          setTimeout(() => {
            toast.classList.remove("toast-active");
          }, 4500);
        }, 500);
      }
    });
  });
});
