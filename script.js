// script.js
let currentPreview = null;
let identifiedCoin = null;
let myCollection = JSON.parse(localStorage.getItem('coinCollection')) || [];

const demoCoins = [
    {
        name: "1955 Lincoln Wheat Penny",
        subtitle: "Double Die Obverse • Rare Error",
        value: "$1,850",
        year: "1955",
        country: "🇺🇸 USA",
        type: "Wheat Cent",
        diameter: "19 mm",
        weight: "3.11 g",
        material: "Copper",
        rarity: "High"
    },
    {
        name: "1932 Washington Quarter",
        subtitle: "Silver • San Francisco Mint",
        value: "$420",
        year: "1932",
        country: "🇺🇸 USA",
        type: "Quarter Dollar",
        diameter: "24.3 mm",
        weight: "6.25 g",
        material: "90% Silver",
        rarity: "Medium"
    },
    {
        name: "2005 2 Euro Coin",
        subtitle: "Germany • Brandenburg Gate",
        value: "€2.50",
        year: "2005",
        country: "🇩🇪 Germany",
        type: "Commemorative",
        diameter: "25.75 mm",
        weight: "8.5 g",
        material: "Bimetallic",
        rarity: "Common"
    },
    {
        name: "1889-CC Morgan Dollar",
        subtitle: "Carson City Mint • Key Date",
        value: "$4,200",
        year: "1889",
        country: "🇺🇸 USA",
        type: "Morgan Dollar",
        diameter: "38.1 mm",
        weight: "26.73 g",
        material: "90% Silver",
        rarity: "Very High"
    }
];

// Initialize
$(document).ready(function () {
    renderCollection();
    renderExampleCoins();

    // Upload button
    $('#upload-btn').on('click', function () {
        $('#file-input').click();
    });

    // Camera button (simulates upload)
    $('#camera-btn').on('click', function () {
        $('#file-input').click();
    });

    $('#file-input').on('change', handleFileUpload);

    // Drag & Drop
    const dropZone = $('#drop-zone');
    dropZone.on('dragover', function (e) {
        e.preventDefault();
        dropZone.addClass('dragover');
    });
    dropZone.on('dragleave', function () {
        dropZone.removeClass('dragover');
    });
    dropZone.on('drop', function (e) {
        e.preventDefault();
        dropZone.removeClass('dragover');
        handleFileUpload(e.originalEvent.dataTransfer);
    });

    console.log('%c🪙 AI Coin Identifier Web ready!', 'color:#ffc107;font-weight:bold');
});

// Handle file upload
function handleFileUpload(e) {
    let files;
    if (e.target && e.target.files) files = e.target.files;
    else if (e.files) files = e.files;
    else return;

    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert("❌ Please upload a valid image file");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (ev) {
        currentPreview = ev.target.result;
        $('#coin-preview').attr('src', currentPreview);
        $('#preview-area').removeClass('d-none');
        // Reset previous result
        identifiedCoin = null;
    };
    reader.readAsDataURL(file);
}

// Simulate AI identification
function startAIIdentification() {
    if (!currentPreview) return;

    const loadingBtn = document.querySelector('button[onclick="startAIIdentification()"]');
    const originalText = loadingBtn.innerHTML;
    loadingBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> 🤖 AI ANALYZING...`;
    loadingBtn.disabled = true;

    // Simulate AI delay
    setTimeout(() => {
        // Pick random coin from demo
        identifiedCoin = demoCoins[Math.floor(Math.random() * demoCoins.length)];
        
        // Show result in modal
        const modal = new bootstrap.Modal(document.getElementById('resultModal'));
        
        $('#modal-coin-image').attr('src', currentPreview);
        $('#coin-name').text(identifiedCoin.name);
        $('#coin-subtitle').text(identifiedCoin.subtitle);
        $('#coin-value').text(identifiedCoin.value);
        $('#coin-year-country').html(`${identifiedCoin.year} • ${identifiedCoin.country}`);
        
        // Details table
        let detailsHTML = `
            <tr><td><strong>Type</strong></td><td>${identifiedCoin.type}</td></tr>
            <tr><td><strong>Diameter</strong></td><td>${identifiedCoin.diameter}</td></tr>
            <tr><td><strong>Weight</strong></td><td>${identifiedCoin.weight}</td></tr>
            <tr><td><strong>Material</strong></td><td>${identifiedCoin.material}</td></tr>
            <tr><td><strong>Rarity</strong></td><td class="text-warning">${identifiedCoin.rarity}</td></tr>
        `;
        $('#coin-details').html(detailsHTML);
        
        modal.show();
        
        // Reset button
        loadingBtn.innerHTML = originalText;
        loadingBtn.disabled = false;
    }, 2400);
}

// Save identified coin to collection
function saveToCollection() {
    if (!identifiedCoin) return;
    
    const coinToSave = {
        ...identifiedCoin,
        id: Date.now(),
        photo: currentPreview,
        savedDate: new Date().toLocaleDateString()
    };
    
    myCollection.unshift(coinToSave);
    localStorage.setItem('coinCollection', JSON.stringify(myCollection));
    
    bootstrap.Modal.getInstance(document.getElementById('resultModal')).hide();
    
    renderCollection();
    
    // Scroll to collection
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        alert(`✅ ${identifiedCoin.name} saved to your collection!`);
    }, 600);
}

// Render collection
function renderCollection() {
    const grid = $('#collection-grid');
    const empty = $('#empty-collection');
    
    grid.empty();
    
    if (myCollection.length === 0) {
        empty.removeClass('d-none');
        return;
    }
    
    empty.addClass('d-none');
    
    myCollection.forEach((coin, index) => {
        const html = `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card bg-dark border-warning coin-card h-100">
                <div class="position-relative">
                    <img src="${coin.photo}" class="card-img-top" style="height:180px;object-fit:cover;" alt="${coin.name}">
                    <div class="position-absolute top-0 end-0 m-2 badge bg-success">${coin.value}</div>
                </div>
                <div class="card-body">
                    <h6 class="card-title">${coin.name}</h6>
                    <p class="small text-muted">${coin.year} • ${coin.country}</p>
                    <button onclick="removeFromCollection(${index});" class="btn btn-sm btn-outline-danger w-100">🗑️ Remove</button>
                </div>
            </div>
        </div>`;
        grid.append(html);
    });
}

function removeFromCollection(index) {
    myCollection.splice(index, 1);
    localStorage.setItem('coinCollection', JSON.stringify(myCollection));
    renderCollection();
}

// Render example coins (click to "scan" instantly)
function renderExampleCoins() {
    const container = $('#example-coins');
    demoCoins.forEach(coin => {
        const html = `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
            <div onclick="quickIdentify(this)" class="coin-card card bg-dark border-0 shadow-sm text-center p-3" style="cursor:pointer;">
                <div class="fs-1 mb-3">🪙</div>
                <h6>${coin.name}</h6>
                <p class="small text-warning mb-0">${coin.value}</p>
                <p class="small text-muted">${coin.year} • ${coin.country}</p>
            </div>
        </div>`;
        container.append(html);
    });
}

function quickIdentify(el) {
    // Simulate instant scan from example
    const index = Array.from(el.parentElement.parentElement.children).indexOf(el.parentElement);
    identifiedCoin = demoCoins[index % demoCoins.length];
    currentPreview = 'https://via.placeholder.com/600x600/2c1f00/ffc107?text=DEMO+COIN'; // placeholder
    
    const modal = new bootstrap.Modal(document.getElementById('resultModal'));
    $('#modal-coin-image').attr('src', 'https://via.placeholder.com/600x600/2c1f00/ffc107?text=DEMO+COIN');
    $('#coin-name').text(identifiedCoin.name);
    $('#coin-subtitle').text(identifiedCoin.subtitle);
    $('#coin-value').text(identifiedCoin.value);
    $('#coin-year-country').html(`${identifiedCoin.year} • ${identifiedCoin.country}`);
    
    let detailsHTML = `
        <tr><td><strong>Type</strong></td><td>${identifiedCoin.type}</td></tr>
        <tr><td><strong>Diameter</strong></td><td>${identifiedCoin.diameter}</td></tr>
        <tr><td><strong>Weight</strong></td><td>${identifiedCoin.weight}</td></tr>
        <tr><td><strong>Material</strong></td><td>${identifiedCoin.material}</td></tr>
        <tr><td><strong>Rarity</strong></td><td class="text-warning">${identifiedCoin.rarity}</td></tr>
    `;
    $('#coin-details').html(detailsHTML);
    
    modal.show();
}
