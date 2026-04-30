/**
 * Inicialización del catálogo
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

/**
 * Obtención de libros desde API y renderizado
 */
async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const container = document.getElementById('catalog-container');
        
        if (!container) return;

        /** Limpieza de contenedor */
        container.innerHTML = ''; 

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            /** Atributos de accesibilidad ARIA */
            card.setAttribute('role', 'article');
            card.setAttribute('tabindex', '0'); 
            card.setAttribute('aria-label', `Ver detalles del libro ${book.title}`);
            
            /** Gestión de navegación por clic */
            card.onclick = () => {
                window.location.href = `details.html?id=${book.id}`;
            };

            /** Soporte de navegación por teclado */
            card.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    window.location.href = `details.html?id=${book.id}`;
                }
            };

            const authorFullName = `${book.authors.first_name} ${book.authors.last_name}`;
            
            /** Estructura de tarjeta y atributos alt descriptivos */
            card.innerHTML = `
                <img src="assets/images/${book.cover_image_url}" 
                     alt="Portada del libro ${book.title} de ${authorFullName}">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${authorFullName}</p>
                    <p class="description">${book.short_description}</p>
                </div>
            `;
            
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error API fetchBooks:', error);
    }
}