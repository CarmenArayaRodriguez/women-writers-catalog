/**
 * Gestión de carga dinámica para la vista de detalles
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');

    if (!bookId) return;

    /** Consulta de datos del recurso mediante ID */
    fetch(`/api/books/${bookId}`)
        .then(res => {
            if (!res.ok) throw new Error('Error de red');
            return res.json();
        })
        .then(book => {
            const author = book.authors; 
            if (!author) return;

            const fullName = `${author.first_name} ${author.last_name}`;
            
            /** Actualización de metadatos del documento */
            const initial = author.first_name.charAt(0).toUpperCase();
            document.title = `${initial}. ${author.last_name} - ${book.title}`;

            /** Inserción de contenido en el DOM */
            document.getElementById('book-title').textContent = book.title;
            document.getElementById('book-author').textContent = fullName;
            
            /** Configuración de imagen y accesibilidad */
            const coverImg = document.getElementById('book-cover');
            coverImg.src = `assets/images/${book.cover_image_url}`;
            coverImg.alt = `Portada de la obra ${book.title} de ${fullName}`;
            
            /** Renderizado de sinopsis y ficha técnica */
            document.getElementById('book-synopsis').innerHTML = `<p>${book.synopsis}</p>`;
            document.getElementById('book-publisher').textContent = book.publisher;
            document.getElementById('book-year').textContent = book.year;
            document.getElementById('book-genre').textContent = book.genre;
            document.getElementById('book-country').textContent = author.country || 'N/A';
        })
        .catch(err => {
            console.error("Error API detail-script:", err);
            const titleElement = document.getElementById('book-title');
            if (titleElement) {
                titleElement.textContent = "Error al recuperar datos";
                titleElement.setAttribute('role', 'alert');
            }
        });
});