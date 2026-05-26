/**
 * Inicialización del catálogo
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

let allBooks = []; 

/**
 * Obtención de libros desde API y renderizado
 */
async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        allBooks = await response.json(); 
        const books = allBooks; 
        const container = document.getElementById('catalog-container');
        
        if (!container) return;

        /** Limpieza de contenedor */
        container.innerHTML = ''; 

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.setAttribute('data-id', book.id);
            
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

/**
 * Evalúa las condiciones de búsqueda y ordenamiento para manipular la visibilidad en el DOM.
 */
function filterAndOrderCatalog() {
    const searchInput = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const orderSelect = document.getElementById('order-select')?.value || 'az';

    // Filtrado de la colección basado en criterios de coincidencia parcial
    let filteredBooks = allBooks.filter(book => {
        const authorFullName = `${book.authors.first_name} ${book.authors.last_name}`.toLowerCase();
        const bookTitle = book.title.toLowerCase();
        
        return searchInput === '' || bookTitle.includes(searchInput) || authorFullName.includes(searchInput);
    });

    // Aplicación del criterio de ordenación alfabética según la opción activa
    if (orderSelect === 'za') {
        filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
    } else if (orderSelect === 'author-az') {
        filteredBooks.sort((a, b) => {
            const compareLastName = a.authors.last_name.localeCompare(b.authors.last_name);
            if (compareLastName !== 0) return compareLastName;
            return a.authors.first_name.localeCompare(b.authors.first_name);
        });
    } else if (orderSelect === 'author-za') {
        filteredBooks.sort((a, b) => {
            const compareLastName = b.authors.last_name.localeCompare(a.authors.last_name);
            if (compareLastName !== 0) return compareLastName;
            return b.authors.first_name.localeCompare(a.authors.first_name);
        });
    } else {
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    }

    const container = document.getElementById('catalog-container');
    if (!container) return;

    const cards = Array.from(container.getElementsByClassName('book-card'));

    // Reordenamiento físico de los nodos y asignación de visibilidad según la colección filtrada
    filteredBooks.forEach(book => {
        // Localización de la tarjeta mediante la coincidencia del identificador UUID
        const targetCard = cards.find(card => card.getAttribute('data-id') === book.id);
        
        if (targetCard) {
            targetCard.style.display = 'block';
            container.appendChild(targetCard); 
        }
    });

    // Ocultamiento de los elementos que no superaron el criterio de filtrado
    cards.forEach(card => {
        const cardUuid = card.getAttribute('data-id');
        const isPresent = filteredBooks.some(book => book.id === cardUuid);
        if (!isPresent) {
            card.style.display = 'none';
        }
    });
}