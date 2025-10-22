import { db, getUserCoins, updateUserCoins, getUserItems, addUserItem, getUserFrame, updateUserFrame } from '../utils/database.js';

// --- Función para formatear números ---
function formatCoinNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
}

// --- Función principal de la tienda, ahora recibe el evento ---
async function inicializarTienda(event) {
    const { user } = event.detail; // Obtenemos el usuario directamente del evento

    if (!user) {
        console.error('Usuario no autenticado (recibido del loader). No se puede cargar la tienda.');
        // Opcional: Redirigir o mostrar un mensaje claro en la UI
        // window.location.href = '/public/pages/login.html';
        return;
    }

    console.log(`app-ready event received. User UID: ${user.uid}. Initializing shop...`);

    const shopGrid = document.querySelector('.shop-grid');
    const userCoinsEl = document.getElementById('user-coins');
    const framePreview = document.getElementById('frame-preview');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');

    if (!shopGrid || !userCoinsEl || !framePreview || !confirmationModal || !confirmPurchaseBtn || !cancelPurchaseBtn) {
        console.error("Faltan elementos esenciales del DOM para la tienda.");
        return;
    }

    const articles = [
        { id: 1, name: 'Marco 1', price: 0, image: '/public/images/marco1.webp' },
        { id: 2, name: 'Marco 2', price: 500, image: '/public/images/marco2.webp' },
        { id: 3, name: 'Marco 3', price: 1000, image: '/public/images/marco3.webp' },
        { id: 4, name: 'Marco 4', price: 1500, image: '/public/images/marco4.webp' },
        { id: 5, name: 'Marco 5', price: 2500, image: '/public/images/marco5.webp' },
        { id: 6, name: 'Marco 6', price: 3000, image: '/public/images/marco6.webp' },
    ];

    let selectedArticleElement = null;
    let articleToPurchase = null;

    let [userCoins, userItems, equippedFrame] = await Promise.all([
        getUserCoins(user.uid),
        getUserItems(user.uid),
        getUserFrame(user.uid)
    ]);

    userCoinsEl.textContent = formatCoinNumber(userCoins);
    if (equippedFrame) framePreview.src = equippedFrame;

    shopGrid.innerHTML = '';

    articles.forEach(article => {
        const item = document.createElement('div');
        item.classList.add('shop-item');

        const isPurchased = userItems.includes(article.id);
        if (isPurchased) item.classList.add('purchased');
        if (article.image === equippedFrame) {
            item.classList.add('selected');
            selectedArticleElement = item;
        }

        item.innerHTML = `
            <img src="${article.image}" alt="${article.name}">
            <div class="item-price">
                ${isPurchased ? '<span>✅</span>' : `<img src="/public/images/moneda.webp" alt="Moneda"><span>${article.price === 0 ? 'GRATIS' : article.price}</span>`}
            </div>
        `;

        item.addEventListener('click', () => {
            if (item.classList.contains('purchased')) {
                if (selectedArticleElement) selectedArticleElement.classList.remove('selected');
                item.classList.add('selected');
                selectedArticleElement = item;
                framePreview.src = article.image;
                updateUserFrame(user.uid, article.image);
            } else if (userCoins >= article.price) {
                articleToPurchase = { article, itemElement: item };
                confirmationModal.style.display = 'flex';
            } else {
                alert('No tienes suficientes monedas.');
            }
        });

        shopGrid.appendChild(item);
    });

    cancelPurchaseBtn.onclick = () => {
        confirmationModal.style.display = 'none';
        articleToPurchase = null;
    };

    confirmPurchaseBtn.onclick = async () => {
        if (!articleToPurchase) return;

        const { article, itemElement } = articleToPurchase;

        if (userCoins < article.price) {
            alert("Fondos insuficientes.");
            confirmationModal.style.display = 'none';
            return;
        }

        try {
            await Promise.all([
                updateUserCoins(user.uid, userCoins - article.price),
                addUserItem(user.uid, article.id),
                updateUserFrame(user.uid, article.image)
            ]);

            userCoins -= article.price;
            userCoinsEl.textContent = formatCoinNumber(userCoins);
            itemElement.classList.add('purchased');
            itemElement.querySelector('.item-price').innerHTML = '<span>✅</span>';
            if (selectedArticleElement) selectedArticleElement.classList.remove('selected');
            itemElement.classList.add('selected');
            selectedArticleElement = itemElement;
            framePreview.src = article.image;
            
            confirmationModal.style.display = 'none';
            articleToPurchase = null;

        } catch (error) {
            console.error("Error durante la compra:", error);
            alert("Ocurrió un error al procesar tu compra.");
        }
    };
}

// --- Punto de Entrada: Escuchar el evento app-ready ---
document.addEventListener('app-ready', inicializarTienda);
