(function () {
    function initHeroHeader() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) return;

        const collapseOffset = Number(hero.getAttribute('data-hero-collapse-offset')) || 24;

        const update = () => {
            if (window.scrollY > collapseOffset) {
                hero.classList.add('hero-header--collapsed');
            } else {
                hero.classList.remove('hero-header--collapsed');
            }
        };

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initServiceSearch() {
        const searchInput = document.querySelector('[data-service-search]');
        if (!searchInput) return;

        const services = Array.from(document.querySelectorAll('.service'));
        if (!services.length) return;

        const sections = Array.from(document.querySelectorAll('[data-service-section]'));
        const emptyState = document.querySelector('[data-search-empty]');

        const normalize = (value) => value.normalize('NFKD').toLowerCase();

        const filter = () => {
            const query = normalize(searchInput.value.trim());
            let visibleCount = 0;

            services.forEach((service) => {
                const nameNode = service.querySelector('.service_name');
                const text = nameNode ? normalize(nameNode.textContent || '') : '';
                const matches = !query || text.includes(query);
                service.classList.toggle('service--hidden', !matches);
                if (matches) {
                    visibleCount += 1;
                }
            });

            sections.forEach((section) => {
                const hasVisible = section.querySelector('.service:not(.service--hidden)');
                section.classList.toggle('service-section--hidden', Boolean(query) && !hasVisible);
            });

            if (emptyState) {
                emptyState.classList.toggle('search-empty--visible', Boolean(query) && visibleCount === 0);
            }
        };

        searchInput.addEventListener('input', filter);
        filter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeroHeader();
        initServiceSearch();
    });
})();
