import { db, getUserCoins, updateUserCoins, getUserItems, addUserItem } from '../utils/database.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const articles = [
                { id: 1, name: 'Marco 1', price: 0, image: '/public/images/marco1.png' },
                { id: 2, name: 'Marco 2', price: 500, image: '/public/images/marco2.png' },
                { id: 3, name: 'Marco 3', price: 1000, image: '/public/images/marco3.png' },
                { id: 4, name: 'Marco 4', price: 1500, image: '/public/images/marco4.png' },
                { id: 5, name: 'Marco 5', price: 2500, image: '/public/images/marco5.png' },
                { id: 6, name: 'Marco 6', price: 3000, image: '/public/images/marco6.png' },
            ];

            const shopGrid = document.querySelector('.shop-grid');
            const userCoinsEl = document.getElementById('user-coins');
            const framePreview = document.getElementById('frame-preview');

            let selectedArticle = null;
            let userCoins = await getUserCoins(user.uid);
            userCoinsEl.textContent = userCoins;

            const userItems = await getUserItems(user.uid);

            articles.forEach(article => {
                const item = document.createElement('div');
                item.classList.add('shop-item');

                if (userItems.includes(article.id)) {
                    item.classList.add('purchased');
                }

                item.innerHTML = `
                    <img src="${article.image}" alt="${article.name}">
                    <div class="item-price">
                        <img src="/public/images/moneda.png" alt="Moneda">
                        <span>${article.price === 0 ? 'GRATIS' : article.price}</span>
                    </div>
                `;

                item.addEventListener('click', async () => {
                    if (item.classList.contains('purchased')) {
                        if (selectedArticle) {
                            selectedArticle.classList.remove('selected');
                        }
                        item.classList.add('selected');
                        selectedArticle = item;
                        framePreview.src = article.image;
                    } else if (userCoins >= article.price) {
                        userCoins -= article.price;
                        await updateUserCoins(user.uid, userCoins);
                        await addUserItem(user.uid, article.id);
                        userCoinsEl.textContent = userCoins;
                        item.classList.add('purchased');

                        if (selectedArticle) {
                            selectedArticle.classList.remove('selected');
                        }
                        item.classList.add('selected');
                        selectedArticle = item;
                        framePreview.src = article.image;
                    } else {
                        alert('No tienes suficientes monedas.');
                    }
                });

                shopGrid.appendChild(item);
            });
        }
    });
});
