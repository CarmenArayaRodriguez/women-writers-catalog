/* Carga de datos dinámicos al iniciar la página de detalles */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');

    if (!bookId) {
        console.log("No se encontró un ID de libro en la URL");
        return;
    }

    /* Consulta a la API para obtener los datos del libro por ID */
    fetch(`http://localhost:3000/api/books/${bookId}`)
        .then(res => {
            if (!res.ok) throw new Error('Error en la respuesta del servidor');
            return res.json();
        })
        .then(book => {
            
            /* Formateo del título de la pestaña (Inicial. Apellido - Título) */
            if (book.author_name) {
                const nameParts = book.author_name.trim().split(" ");
                const initial = nameParts[0].charAt(0).toUpperCase();
                const lastName = nameParts[nameParts.length - 1];
                
                document.title = `${initial}. ${lastName} - ${book.title}`;
            }

            /* Inserción de datos en los elementos del DOM */
            document.getElementById('book-title').textContent = book.title;
            document.getElementById('book-author').textContent = book.author_name;
            document.getElementById('book-cover').src = `assets/images/${book.cover_image_url}`;
            
            /* Renderizado de la sinopsis permitiendo formato de párrafo */
            document.getElementById('book-synopsis').innerHTML = `<p>${book.synopsis}</p>`;
            
            /* Despliegue de metadatos técnicos y de autoría */
            document.getElementById('book-publisher').textContent = book.publisher;
            document.getElementById('book-year').textContent = book.year;
            document.getElementById('book-genre').textContent = book.genre;
            document.getElementById('book-country').textContent = book.author_country;
        })
        .catch(err => {
            console.error("Error al cargar los detalles del libro:", err);
        });
});