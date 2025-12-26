(() => {
  const MOBILE_MEDIA = window.matchMedia('(max-width: 991px)');

  const initNavs = () => {
    const navs = document.querySelectorAll('.w-nav');
    navs.forEach((nav, index) => {
      const button = nav.querySelector('.w-nav-button');
      const menu = nav.querySelector('.w-nav-menu');
      if (!button || !menu) {
        return;
      }
      if (!menu.id) {
        menu.id = `nav-menu-${index + 1}`;
      }
      button.setAttribute('aria-controls', menu.id);
      button.setAttribute('aria-expanded', 'false');

      const closeNav = () => {
        button.classList.remove('w--open');
        menu.classList.remove('w--open');
        menu.removeAttribute('data-nav-menu-open');
        button.setAttribute('aria-expanded', 'false');
      };

      const toggleNav = () => {
        const isOpen = !menu.hasAttribute('data-nav-menu-open');
        menu.classList.toggle('w--open', isOpen);
        button.classList.toggle('w--open', isOpen);
        if (isOpen) {
          menu.setAttribute('data-nav-menu-open', '');
        } else {
          menu.removeAttribute('data-nav-menu-open');
        }
        button.setAttribute('aria-expanded', String(isOpen));
      };

      button.addEventListener('click', (event) => {
        event.preventDefault();
        toggleNav();
      });

      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (MOBILE_MEDIA.matches) {
            closeNav();
          }
        });
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeNav();
        }
      });
    });
  };

  const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.w-dropdown');
    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.w-dropdown-toggle');
      const list = dropdown.querySelector('.w-dropdown-list');
      if (!toggle || !list) {
        return;
      }
      toggle.setAttribute('aria-expanded', 'false');

      const closeDropdown = () => {
        dropdown.classList.remove('w--open');
        toggle.classList.remove('w--open');
        list.classList.remove('w--open');
        toggle.setAttribute('aria-expanded', 'false');
      };

      const toggleDropdown = (event) => {
        event.preventDefault();
        const isOpen = !dropdown.classList.contains('w--open');
        dropdown.classList.toggle('w--open', isOpen);
        toggle.classList.toggle('w--open', isOpen);
        list.classList.toggle('w--open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      };

      toggle.addEventListener('click', toggleDropdown);

      document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
          closeDropdown();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeDropdown();
        }
      });
    });
  };

  const initAccordions = () => {
    const accordions = document.querySelectorAll('.accordion-item');
    accordions.forEach((item) => {
      const trigger = item.querySelector('.accordion-top');
      const panel = item.querySelector('.accordion-bottom');
      if (!trigger || !panel) {
        return;
      }
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.height = panel.style.height || '0px';
      item.dataset.accordionReady = '1';

      const closeAccordionItem = (targetItem) => {
        const targetPanel = targetItem.querySelector('.accordion-bottom');
        const targetTrigger = targetItem.querySelector('.accordion-top');
        targetItem.classList.remove('is-open');
        if (targetPanel) {
          targetPanel.style.height = '0px';
        }
        if (targetTrigger) {
          targetTrigger.setAttribute('aria-expanded', 'false');
        }
      };

      const updatePanelHeight = (targetPanel) => {
        if (!targetPanel || !item.classList.contains('is-open')) {
          return;
        }
        targetPanel.style.height = `${targetPanel.scrollHeight}px`;
      };

      const schedulePanelUpdates = () => {
        updatePanelHeight(panel);
        window.setTimeout(() => updatePanelHeight(panel), 80);
      };

      const attachImageListeners = () => {
        panel.querySelectorAll('img').forEach((img) => {
          if (img.dataset.accordionMeasured) {
            return;
          }
          img.dataset.accordionMeasured = '1';
          if (img.complete) {
            return;
          }
          img.addEventListener(
            'load',
            () => {
              updatePanelHeight(panel);
            },
            { once: true },
          );
        });
      };

      const closeItem = () => {
        closeAccordionItem(item);
      };

      const openItem = () => {
        item.classList.add('is-open');
        schedulePanelUpdates();
        attachImageListeners();
        trigger.setAttribute('aria-expanded', 'true');
      };

      trigger.addEventListener('click', () => {
        const container = item.parentElement || item;
        container.querySelectorAll('.accordion-item.is-open').forEach((openItemEl) => {
          if (openItemEl !== item) {
            closeAccordionItem(openItemEl);
          }
        });

        if (item.classList.contains('is-open')) {
          closeItem();
        } else {
          openItem();
        }
      });

      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          trigger.click();
        }
        if (event.key === 'Escape') {
          const container = item.parentElement || item;
          container.querySelectorAll('.accordion-item.is-open').forEach((openItemEl) => {
            closeAccordionItem(openItemEl);
          });
        }
      });

      window.addEventListener('resize', () => {
        if (item.classList.contains('is-open')) {
          updatePanelHeight(panel);
        }
      });
    });
  };

  const initForms = () => {
    const forms = document.querySelectorAll('.w-form');
    forms.forEach((wrapper) => {
      const form = wrapper.querySelector('form');
      const done = wrapper.querySelector('.w-form-done');
      const fail = wrapper.querySelector('.w-form-fail');
      if (!form) {
        return;
      }

      form.addEventListener('submit', (event) => {
        const action = form.getAttribute('action');
        const method = (form.getAttribute('method') || 'get').toLowerCase();
        const shouldHandle = !action || action === '#' || method === 'get';

        if (!shouldHandle) {
          return;
        }

        if (!form.checkValidity()) {
          event.preventDefault();
          if (fail) {
            fail.style.display = 'block';
          }
          if (done) {
            done.style.display = 'none';
          }
          form.reportValidity();
          return;
        }

        event.preventDefault();
        form.style.display = 'none';
        if (fail) {
          fail.style.display = 'none';
        }
        if (done) {
          done.style.display = 'block';
        }
      });
    });
  };

  const initTabs = () => {
    const tabs = document.querySelectorAll('.w-tabs');
    tabs.forEach((tabsEl) => {
      const links = tabsEl.querySelectorAll('.w-tab-link');
      const panes = tabsEl.querySelectorAll('.w-tab-pane');
      if (!links.length || !panes.length) {
        return;
      }

      const activate = (targetName) => {
        links.forEach((link) => {
          const isActive = link.getAttribute('data-w-tab') === targetName;
          link.classList.toggle('w--current', isActive);
          link.setAttribute('aria-selected', String(isActive));
        });
        panes.forEach((pane) => {
          const isActive = pane.getAttribute('data-w-tab') === targetName;
          pane.classList.toggle('w--tab-active', isActive);
          pane.style.display = isActive ? 'block' : 'none';
        });
      };

      const initial = tabsEl.getAttribute('data-current') || links[0].getAttribute('data-w-tab');
      activate(initial);

      links.forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          const targetName = link.getAttribute('data-w-tab');
          if (targetName) {
            activate(targetName);
          }
        });
      });
    });
  };

  // Reveal tuning knobs: CSS variables in styles.css, max candidates per section (10), stagger step (60ms).
  const initRevealAnimations = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const sections = Array.from(document.querySelectorAll('[id^="SLsect-"]'));
    if (!sections.length) {
      return;
    }

    const targets = new Set();
    const preferredSelectors = [
      '.line-left---content',
      '.card-shape-bg',
      '.w-layout-grid',
      '.inner-container',
      '.image-wrapper',
      '.buttons-row',
      '.text-center',
    ];
    const ignoredWrapperSelector = '.page-wrapper, .section, .container-default, .w-container';
    const maxCandidates = 10;
    const staggerStepMs = 60;

    sections.forEach((section) => {
      targets.add(section);

      const queue = Array.from(section.children);
      const bfsNodes = [];
      while (queue.length) {
        const node = queue.shift();
        if (!node || node === section) {
          continue;
        }
        bfsNodes.push(node);
        queue.push(...Array.from(node.children));
      }

      const candidates = [];
      const candidateSet = new Set();
      const addCandidate = (node) => {
        if (!node || candidateSet.has(node)) {
          return;
        }
        candidateSet.add(node);
        candidates.push(node);
      };
      const hasClassPrefix = (node, prefix) => Array.from(node.classList).some((cls) => cls.startsWith(prefix));

      preferredSelectors.forEach((selector) => {
        if (candidates.length >= maxCandidates) {
          return;
        }
        bfsNodes.forEach((node) => {
          if (candidates.length >= maxCandidates) {
            return;
          }
          if (node.matches(selector)) {
            addCandidate(node);
          }
        });
      });

      bfsNodes.forEach((node) => {
        if (candidates.length >= maxCandidates) {
          return;
        }
        if (hasClassPrefix(node, 'mg-top-') || hasClassPrefix(node, 'grid-')) {
          addCandidate(node);
        }
      });

      if (candidates.length < 8) {
        bfsNodes.forEach((node) => {
          if (candidates.length >= maxCandidates) {
            return;
          }
          if (node.matches(ignoredWrapperSelector)) {
            return;
          }
          const hasContent =
            node.textContent.trim().length > 0 || node.querySelector('img, button, .w-button, svg');
          const isLeaf = node.children.length <= 3;
          if (hasContent && isLeaf) {
            addCandidate(node);
          }
        });
      }

      const shouldStagger = candidates.length > 1;
      candidates.forEach((candidate, index) => {
        if (!targets.has(candidate)) {
          targets.add(candidate);
          if (shouldStagger) {
            const delay = Math.min(index * staggerStepMs, 420);
            candidate.style.transitionDelay = `${delay}ms`;
            candidate.dataset.revealDelay = String(delay);
          }
        }
      });
    });

    targets.forEach((target) => {
      if (target.dataset.reveal) {
        return;
      }
      target.dataset.reveal = '1';
      target.classList.add('reveal-ready');
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => {
        target.classList.add('reveal-in');
        target.classList.remove('reveal-ready');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            window.requestAnimationFrame(() => {
              target.classList.add('reveal-in');
              target.classList.remove('reveal-ready');
              const delay = parseInt(target.dataset.revealDelay || '0', 10);
              if (delay > 0) {
                window.setTimeout(() => {
                  target.style.transitionDelay = '';
                  delete target.dataset.revealDelay;
                }, delay + 80);
              }
            });
            obs.unobserve(target);
          }
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      },
    );

    targets.forEach((target) => observer.observe(target));
  };

  document.addEventListener('DOMContentLoaded', () => {
    initNavs();
    initDropdowns();
    initAccordions();
    initForms();
    initTabs();
    initRevealAnimations();
  });
})();
