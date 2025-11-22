document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            gallery.innerHTML = ''; // Clear loading state
            
            if (data.cases.length === 0) {
                gallery.innerHTML = '<div class="loading">No cases found.</div>';
                return;
            }

            // Generate Filters
            const types = new Set();
            data.cases.forEach(c => {
                if (c.capability_type) {
                    if (Array.isArray(c.capability_type)) {
                        c.capability_type.forEach(t => types.add(t));
                    } else {
                        types.add(c.capability_type);
                    }
                }
            });

            const filtersContainer = document.getElementById('filters');
            Array.from(types).sort().forEach(type => {
                const btn = document.createElement('button');
                // Map type to class name
                const typeMap = {
                    'Physics': 'type-physics',
                    'Cinematic Photo': 'type-cinematic',
                    'Typography': 'type-typography',
                    'Multi Character': 'type-multi',
                    'Stylized Characters': 'type-stylized',
                    'Surreal Concepts': 'type-surreal',
                    'Maps Layout': 'type-maps',
                    'Pattern Design': 'type-pattern',
                    'Image Editing': 'type-editing'
                };
                const typeClass = typeMap[type] || 'type-editing';
                
                btn.className = `filter-btn ${typeClass}`;
                btn.dataset.filter = type;
                btn.textContent = type;
                filtersContainer.appendChild(btn);
            });

            // Filter Logic
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active to clicked
                    btn.classList.add('active');

                    const filterValue = btn.dataset.filter;
                    const cards = document.querySelectorAll('.case-card');

                    cards.forEach(card => {
                        if (filterValue === 'all') {
                            card.style.display = 'grid';
                        } else {
                            // Get types from dataset, split by comma
                            const cardTypes = (card.dataset.types || '').split(',');
                            if (cardTypes.includes(filterValue)) {
                                card.style.display = 'grid';
                            } else {
                                card.style.display = 'none';
                            }
                        }
                    });
                });
            });

            data.cases.forEach(item => {
                const card = createCaseCard(item);
                gallery.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading data:', error);
            gallery.innerHTML = '<div class="loading">Error loading cases. Please try again later.</div>';
        });

    // Lightbox functionality
    function openLightbox(imageSrc, caption) {
        lightbox.classList.add('active');
        lightboxImg.src = imageSrc;
        lightboxCaption.textContent = caption || '';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    // Close lightbox on X button click
    lightboxClose.addEventListener('click', closeLightbox);

    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close lightbox on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Store openLightbox function globally for card creation
    window.openLightbox = openLightbox;
});

function createCaseCard(c) {
    const card = document.createElement('article');
    card.className = 'case-card';
    card.id = `case-${c.case_no}`;
    
    let capabilityTypes = [];
    if (Array.isArray(c.capability_type)) {
        capabilityTypes = c.capability_type;
    } else if (c.capability_type) {
        capabilityTypes = [c.capability_type];
    }
    
    if (capabilityTypes.length > 0) {
        card.dataset.types = capabilityTypes.join(',');
    }

    // 1. Info Column (Prompt & Meta)
    const infoCol = document.createElement('div');
    infoCol.className = 'case-info';

    let typeBadgeHTML = '';
    if (capabilityTypes.length > 0) {
        // Map types to CSS classes
        const typeMap = {
            'Physics': 'type-physics',
            'Cinematic Photo': 'type-cinematic',
            'Typography': 'type-typography',
            'Multi Character': 'type-multi',
            'Stylized Characters': 'type-stylized',
            'Surreal Concepts': 'type-surreal',
            'Maps Layout': 'type-maps',
            'Pattern Design': 'type-pattern',
            'Image Editing': 'type-editing'
        };
        
        capabilityTypes.forEach(type => {
            const badgeClass = typeMap[type] || 'type-editing';
            typeBadgeHTML += `<span class="type-badge ${badgeClass}">${type}</span> `; // Added space for separation
        });
    }

    const headerHTML = `
        <div class="case-header">
            <span class="case-id">#${c.case_no}</span>
            <h2 class="case-title">${c.title}</h2>
            <div class="type-badges">${typeBadgeHTML}</div>
        </div>
    `;

    const promptHTML = `
        <div class="case-prompt-container">
            <div class="case-label">Prompt</div>
            <div class="case-prompt">${c.prompt}</div>
        </div>
    `;

    let metaHTML = '<div class="case-meta">';
    if (c.attribution.prompt_author) {
        const link = c.attribution.prompt_author_link ? `href="${c.attribution.prompt_author_link}" target="_blank"` : '';
        metaHTML += `<div class="meta-item">Prompt: <a ${link}>${c.attribution.prompt_author}</a></div>`;
    }
    if (c.source_links && c.source_links.length > 0) {
        metaHTML += `<div class="meta-item"><a href="${c.source_links[0].url}" target="_blank">Source ↗</a></div>`;
    }
    metaHTML += '</div>';

    infoCol.innerHTML = headerHTML + promptHTML + metaHTML;


    // 2. References Column
    const refsCol = document.createElement('div');
    refsCol.className = 'case-refs';
    
    if (c.reference_images && c.reference_images.length > 0) {
        const label = document.createElement('div');
        label.className = 'case-label';
        label.style.width = '100%';
        label.style.textAlign = 'center';
        label.textContent = 'References';
        refsCol.appendChild(label);

        c.reference_images.forEach(refImg => {
            const refWrapper = document.createElement('div');
            refWrapper.className = 'ref-item';
            const img = document.createElement('img');
            img.src = `images/${c.case_no}/${refImg}`;
            img.alt = 'Reference';
            img.loading = 'lazy';
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                window.openLightbox(`images/${c.case_no}/${refImg}`, `Reference - Case #${c.case_no}`);
            });
            refWrapper.appendChild(img);
            refsCol.appendChild(refWrapper);
        });
    } else {
        refsCol.innerHTML = '<div class="no-ref">No Reference Images</div>';
    }


    // 3. Visual Column (Case Image)
    const visualCol = document.createElement('div');
    visualCol.className = 'case-visual';
    const mainImg = document.createElement('img');
    mainImg.src = `images/${c.case_no}/${c.image}`;
    mainImg.alt = c.alt_text;
    mainImg.loading = 'lazy';
    mainImg.style.cursor = 'pointer';
    mainImg.addEventListener('click', () => {
        window.openLightbox(`images/${c.case_no}/${c.image}`, `Case #${c.case_no}: ${c.title}`);
    });
    visualCol.appendChild(mainImg);


    // Append columns based on layout
    // Layout: Info | Refs | Visual
    card.appendChild(infoCol);
    card.appendChild(refsCol);
    card.appendChild(visualCol);

    return card;
}

