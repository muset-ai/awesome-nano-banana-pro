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

    // 1. Info Column (Prompt & Meta)
    const infoCol = document.createElement('div');
    infoCol.className = 'case-info';

    const headerHTML = `
        <div class="case-header">
            <span class="case-id">#${c.case_no}</span>
            <h2 class="case-title">${c.title}</h2>
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

