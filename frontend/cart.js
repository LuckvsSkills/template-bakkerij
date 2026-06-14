// cart.js — Bakkerij Winkelwagen + Leverplanner
// ARC AI Agents Website Fabriek

let products = { vers: [], materiaal: [] };
let blockedDates = { blocked_dates: [], blocked_weekdays: [0] };
let cart = [];
let activeCategory = 'vers';

// --- Data laden ---
async function loadData() {
    const [prodRes, blockRes] = await Promise.all([
        fetch('../data/products.json'),
        fetch('../data/blocked_dates.json')
    ]);
    products = await prodRes.json();
    blockedDates = await blockRes.json();
    renderProducts();
}

// --- Producten renderen ---
function renderProducts() {
    const grid = document.getElementById('productGrid');
    const items = products[activeCategory] || [];
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="product-image-placeholder"></div>
            <h3>${p.naam}</h3>
            <p class="product-desc">${p.beschrijving}</p>
            <div class="product-footer">
                <span class="product-price">€${p.prijs.toFixed(2).replace('.', ',')}</span>
                ${p.categorie === 'vers'
                    ? `<span class="badge badge-levertijd">${p.levertijd_dagen} dagen levertijd</span>`
                    : (p.voorraad > 0
                        ? `<span class="badge badge-voorraad">Op voorraad</span>`
                        : `<span class="badge badge-uit">Uitverkocht</span>`)
                }
            </div>
            <button class="btn-primary btn-add" data-id="${p.id}" data-cat="${p.categorie}"
                ${p.categorie === 'materiaal' && p.voorraad <= 0 ? 'disabled' : ''}>
                Toevoegen
            </button>
        </div>
    `).join('');

    grid.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', () => addToCart(btn.dataset.id, btn.dataset.cat));
    });
}

// --- Winkelwagen ---
function addToCart(id, categorie) {
    const product = products[categorie].find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.aantal += 1;
    } else {
        cart.push({ ...product, aantal: 1 });
    }
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

function updateQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.aantal += delta;
    if (item.aantal <= 0) {
        removeFromCart(id);
    } else {
        renderCart();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const deliveryInfo = document.getElementById('deliveryInfo');

    const totalCount = cart.reduce((sum, i) => sum + i.aantal, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.prijs * i.aantal, 0);

    cartCount.textContent = totalCount;
    cartTotal.textContent = `€${totalPrice.toFixed(2).replace('.', ',')}`;

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.naam}</strong>
                <span>€${item.prijs.toFixed(2).replace('.', ',')} x ${item.aantal}</span>
                ${item.categorie === 'vers' ? `<span class="badge badge-levertijd">${item.levertijd_dagen}d</span>` : ''}
            </div>
            <div class="cart-item-actions">
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <span>${item.aantal}</span>
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">&times;</button>
            </div>
        </div>
    `).join('');

    // --- Leverdatum berekening ---
    const versItems = cart.filter(i => i.categorie === 'vers');
    if (versItems.length > 0) {
        const maxLevertijd = Math.max(...versItems.map(i => i.levertijd_dagen));
        const minDate = calculateMinDeliveryDate(maxLevertijd);
        deliveryInfo.style.display = 'block';
        document.getElementById('deliveryDate').textContent = formatDate(minDate);

        const picker = document.getElementById('deliveryPicker');
        picker.min = toInputDate(minDate);
        if (!picker.value || new Date(picker.value) < minDate) {
            picker.value = toInputDate(minDate);
        }
    } else {
        deliveryInfo.style.display = 'none';
    }
}

// --- Leverdatum logica ---
function calculateMinDeliveryDate(minDagen) {
    let date = new Date();
    let daysAdded = 0;
    while (daysAdded < minDagen) {
        date.setDate(date.getDate() + 1);
        if (!isBlockedDate(date)) {
            daysAdded++;
        }
    }
    // Als de berekende datum zelf geblokkeerd is, doorschuiven naar volgende vrije dag
    while (isBlockedDate(date)) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

function isBlockedDate(date) {
    const dateStr = toInputDate(date);
    const weekday = date.getDay();
    return blockedDates.blocked_dates.includes(dateStr)
        || blockedDates.blocked_weekdays.includes(weekday);
}

function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDate(date) {
    return date.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// --- Datumpicker validatie ---
function setupDeliveryPicker() {
    const picker = document.getElementById('deliveryPicker');
    picker.addEventListener('change', () => {
        const selected = new Date(picker.value);
        if (isBlockedDate(selected)) {
            alert('Deze datum is niet beschikbaar voor levering. Kies een andere datum.');
            const versItems = cart.filter(i => i.categorie === 'vers');
            const maxLevertijd = versItems.length ? Math.max(...versItems.map(i => i.levertijd_dagen)) : 0;
            picker.value = toInputDate(calculateMinDeliveryDate(maxLevertijd));
        }
    });
}

// --- UI events ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupDeliveryPicker();

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            renderProducts();
        });
    });

    document.getElementById('cartToggle').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.toggle('open');
    });

    document.getElementById('cartClose').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.remove('open');
    });

    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Je winkelwagen is leeg.');
            return;
        }
        const deliveryDate = document.getElementById('deliveryPicker').value;
        const summary = cart.map(i => `${i.aantal}x ${i.naam}`).join('\n');
        const versItems = cart.filter(i => i.categorie === 'vers');
        let msg = `Bestelling overzicht:\n\n${summary}\n\nTotaal: €${cart.reduce((s,i)=>s+i.prijs*i.aantal,0).toFixed(2).replace('.',',')}`;
        if (versItems.length > 0) {
            msg += `\n\nLeverdatum verse producten: ${deliveryDate}`;
        }
        alert(msg + '\n\n(Dit is een demo — koppel hier je betaalprovider)');
    });
});
