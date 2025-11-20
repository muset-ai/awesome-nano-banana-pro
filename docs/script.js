document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');

    // Lightbox elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    // Close Lightbox functions
    const closeLightbox = () => {
        lightbox.style.display = "none";
    };

    closeBtn.onclick = closeLightbox;

    // Close on clicking background
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.style.display === "block") {
            closeLightbox();
        }
    });

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            gallery.innerHTML = ''; // Clear loading state
            
            if (data.cases.length === 0) {
                gallery.innerHTML = '<div class="loading">No cases found.</div>';
                return;
            }

            // Sort cases by case_no in ascending order (1 to 45)
            const sortedCases = [...data.cases].sort((a, b) => a.case_no - b.case_no);

            sortedCases.forEach(item => {
                const card = createCaseCard(item, (imgSrc, altText) => {
                    // Open Lightbox Handler
                    lightbox.style.display = "block";
                    lightboxImg.src = imgSrc;
                    lightboxCaption.textContent = altText;
                });
                gallery.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading data:', error);
            gallery.innerHTML = '<div class="loading">Error loading cases. Please try again later.</div>';
        });
});

function createCaseCard(c, onImageClick) {
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

    // Create Prompt Container manually to attach event listener
    const promptContainer = document.createElement('div');
    promptContainer.className = 'case-prompt-container';
    
    const promptLabel = document.createElement('div');
    promptLabel.className = 'case-label';
    promptLabel.textContent = 'Prompt';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(c.prompt).then(() => {
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    };

    const promptText = document.createElement('div');
    promptText.className = 'case-prompt';
    promptText.textContent = c.prompt;

    promptContainer.appendChild(promptLabel);
    promptContainer.appendChild(copyBtn);
    promptContainer.appendChild(promptText);

    let metaHTML = '<div class="case-meta">';
    if (c.attribution.prompt_author) {
        const link = c.attribution.prompt_author_link ? `href="${c.attribution.prompt_author_link}" target="_blank"` : '';
        metaHTML += `<div class="meta-item">Prompt: <a ${link}>${c.attribution.prompt_author}</a></div>`;
    }
    if (c.source_links && c.source_links.length > 0) {
        metaHTML += `<div class="meta-item"><a href="${c.source_links[0].url}" target="_blank">Source ↗</a></div>`;
    }
    metaHTML += '</div>';

    // Assemble Info Column
    infoCol.innerHTML = headerHTML;
    infoCol.appendChild(promptContainer);
    infoCol.insertAdjacentHTML('beforeend', metaHTML);


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
            img.alt = "Reference";
            img.loading = "lazy";
            img.style.cursor = "pointer";
            
            // Click to open lightbox
            img.onclick = (e) => {
                e.preventDefault();
                onImageClick(`images/${c.case_no}/${refImg}`, "Reference Image");
            };

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
    mainImg.loading = "lazy";
    mainImg.style.cursor = "pointer";

    // Click to open lightbox
    mainImg.onclick = (e) => {
        e.preventDefault();
        onImageClick(`images/${c.case_no}/${c.image}`, c.alt_text);
    };

    visualCol.appendChild(mainImg);


    // Append columns based on layout
    card.appendChild(infoCol);
    card.appendChild(refsCol);
    card.appendChild(visualCol);

    return card;
}
