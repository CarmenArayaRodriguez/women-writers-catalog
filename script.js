/* Inicialización del catálogo tras la carga del DOM */
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

/* Obtención de libros desde la API y renderizado de tarjetas */
async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const container = document.getElementById('catalog-container');
        
        if (!container) return;

        container.innerHTML = ''; 

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            /* Redirección al detalle al hacer clic en la tarjeta */
            card.onclick = () => {
                window.location.href = `details.html?id=${book.id}`;
            };
            
            card.innerHTML = `
                <img src="assets/images/${book.cover_image_url}" alt="${book.title}">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.author_name}</p>
                    <p class="description">${book.short_description}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar los libros en el catálogo:', error);
    }
}