document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');

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
            // Path adjustment: images are stored in images/{case_no}/
            refWrapper.innerHTML = `<a href="images/${c.case_no}/${refImg}" target="_blank"><img src="images/${c.case_no}/${refImg}" alt="Reference" loading="lazy"></a>`;
            refsCol.appendChild(refWrapper);
        });
    } else {
        refsCol.innerHTML = '<div class="no-ref">No Reference Images</div>';
    }


    // 3. Visual Column (Case Image)
    const visualCol = document.createElement('div');
    visualCol.className = 'case-visual';
    // Path adjustment: images are stored in images/{case_no}/
    visualCol.innerHTML = `<a href="images/${c.case_no}/${c.image}" target="_blank"><img src="images/${c.case_no}/${c.image}" alt="${c.alt_text}" loading="lazy"></a>`;


    // Append columns based on layout
    // Layout: Info | Refs | Visual
    card.appendChild(infoCol);
    card.appendChild(refsCol);
    card.appendChild(visualCol);

    return card;
}

