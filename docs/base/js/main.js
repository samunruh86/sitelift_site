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

      const closeItem = () => {
        item.classList.remove('is-open');
        panel.style.height = '0px';
        trigger.setAttribute('aria-expanded', 'false');
      };

      const openItem = () => {
        item.classList.add('is-open');
        panel.style.height = `${panel.scrollHeight}px`;
        trigger.setAttribute('aria-expanded', 'true');
      };

      trigger.addEventListener('click', () => {
        const container = item.parentElement || item;
        container.querySelectorAll('.accordion-item.is-open').forEach((openItemEl) => {
          if (openItemEl !== item) {
            const openPanel = openItemEl.querySelector('.accordion-bottom');
            const openTrigger = openItemEl.querySelector('.accordion-top');
            openItemEl.classList.remove('is-open');
            if (openPanel) {
              openPanel.style.height = '0px';
            }
            if (openTrigger) {
              openTrigger.setAttribute('aria-expanded', 'false');
            }
          }
        });

        if (item.classList.contains('is-open')) {
          closeItem();
        } else {
          openItem();
        }
      });

      window.addEventListener('resize', () => {
        if (item.classList.contains('is-open')) {
          panel.style.height = `${panel.scrollHeight}px`;
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

  document.addEventListener('DOMContentLoaded', () => {
    initNavs();
    initDropdowns();
    initAccordions();
    initForms();
    initTabs();
  });
})();
