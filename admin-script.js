/**
 * Configuración de servicios externos y variables de entorno.
 * Se inicializa en blanco para ser cargada dinámicamente desde el servidor.
 */
let BOOKS_API_KEY = '';

/**
 * Inicialización de componentes y carga de datos administrativos.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    fetchAuthors();
    loadBooksTable();
    setupEventListeners();
});

/**
 * Configuración de escuchadores de eventos.
 */
function setupEventListeners() {
    const bookForm = document.getElementById('book-form');
    const linkLogout = document.getElementById('linkLogout');

    if (bookForm) {
        bookForm.addEventListener('submit', handleBookSubmit);
    }

    if (linkLogout) {
        linkLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
}

/**
 * Procesamiento de persistencia (creación y actualización) de libros.
 */
async function handleBookSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    const bookId = document.getElementById('book-id').value;

    formData.append('title', document.getElementById('title').value);
    formData.append('author_id', document.getElementById('author_select').value);
    formData.append('short_description', document.getElementById('short_description').value);
    formData.append('synopsis', document.getElementById('synopsis').value);
    formData.append('publisher', document.getElementById('publisher').value);
    formData.append('year', document.getElementById('year').value);
    formData.append('genre', document.getElementById('genre').value);

    const coverInput = document.getElementById('cover_file');
    if (coverInput.files[0]) {
        formData.append('cover_file', coverInput.files[0]);
    }

    const url = bookId ? `/api/books/${bookId}` : '/api/books';
    const method = bookId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { 
            method, 
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.ok) {
            const mensaje = bookId ? "Obra actualizada en el catálogo" : "Nueva obra registrada con éxito";
            showToast(mensaje, "success");
            resetBookForm();
            loadBooksTable();
        }
    } catch (err) {
        console.error("Error API handleBookSubmit:", err);
    }
}

/**
 * Renderizado dinámico de la tabla de gestión de obras.
 */
async function loadBooksTable() {
    try {
        const res = await fetch('/api/books');
        const books = await res.json();
        const tbody = document.getElementById('admin-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        books.forEach(b => {
            const authorFullName = `${b.authors.first_name} ${b.authors.last_name}`;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="assets/images/${b.cover_image_url}" width="40" class="img-mini" alt="Miniatura ${b.title}"></td>
                <td>${b.title}</td>
                <td>${authorFullName}</td>
                <td>
                    <button class="btn-edit" onclick="prepareBookEdit('${b.id}')" aria-label="Editar ${b.title}">Editar</button>
                    <button class="btn-delete" onclick="deleteBook('${b.id}', '${b.title}', '${authorFullName}')" aria-label="Eliminar ${b.title}">Borrar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Error API loadBooksTable:", err);
    }
}

/**
 * Recuperación de metadatos de obra para edición en formulario.
 */
async function prepareBookEdit(id) {
    const res = await fetch(`/api/books/${id}`);
    const b = await res.json();

    document.getElementById('book-id').value = b.id;
    document.getElementById('title').value = b.title;
    document.getElementById('author_select').value = b.author_id;
    document.getElementById('short_description').value = b.short_description;
    document.getElementById('synopsis').value = b.synopsis;
    document.getElementById('publisher').value = b.publisher;
    document.getElementById('year').value = b.year;
    document.getElementById('genre').value = b.genre;

    const formTitle = document.getElementById('form-title');
    formTitle.innerText = "Editando: " + b.title;
    formTitle.setAttribute('aria-live', 'polite');

    document.getElementById('btn-submit').innerText = "Guardar Cambios";
    document.getElementById('btn-cancel').style.display = "inline-block";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Eliminación lógica y física de registros de libros.
 */
async function deleteBook(id, title, authorFullName) {
    if (confirm(`¿Eliminar "${title}" de ${authorFullName}?`)) {
        try {
            const res = await fetch(`/api/books/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) loadBooksTable();
        } catch (err) {
            console.error("Error API deleteBook:", err);
        }
    }
}

/**
 * Carga de credenciales de infraestructura desde el entorno del servidor.
 */
async function loadConfig() {
    try {
        const res = await fetch('/api/config/google-books');
        const config = await res.json();
        BOOKS_API_KEY = config.apiKey;
        console.log("Evidencia: Configuración de Books API cargada exitosamente.");
    } catch (err) {
        console.error("Anomalía: Error al cargar la configuración de la API:", err);
    }
}

/**
 * Consulta de metadatos bibliográficos mediante Google Books API.
 * Implementa gestión de estados (spinners) y persistencia en caché local.
 */
async function searchBookInGoogle() {
    const titleInput = document.getElementById('title');
    const title = titleInput.value;
    const searchBtn = document.querySelector('.btn-api-search');
    
    if (!title) {
        showToast("Error: Ingrese un título para la consulta externa", "error");
        return;
    }

    // Gestión del estado de carga en interfaz
    searchBtn.disabled = true;
    const originalText = searchBtn.innerText;
    searchBtn.innerText = "Cargando...";

    try {
        // Estrategia de optimización: Validación de caché local
        const cacheKey = `book_cache_${title.toLowerCase().trim()}`;
        const cachedResult = localStorage.getItem(cacheKey);

        if (cachedResult) {
            console.log("Evidencia: Datos recuperados de LocalStorage.");
            const bookInfo = JSON.parse(cachedResult);
            fillFormWithData(bookInfo);
            showToast("Datos recuperados de la caché local", "success");
            return;
        }

        // Consumo de datos dinámicos mediante Axios
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: `intitle:${title}`,
                key: BOOKS_API_KEY
            }
        });

        if (response.data.totalItems > 0) {
            const bookInfo = response.data.items[0].volumeInfo;
            
            // Persistencia en caché para optimización de rendimiento
            localStorage.setItem(cacheKey, JSON.stringify(bookInfo));
            
            fillFormWithData(bookInfo);
            showToast("Datos recuperados de Google Books", "success");
            
        } else {
            showToast("No se encontraron registros coincidentes", "error"); 
        }
    } catch (error) {
        console.error("Anomalía en la integración externa:", error.message);
        showToast("Error de conexión con el servicio externo", "error"); 
    } finally {
        // Restablecimiento de la interactividad del control
        searchBtn.disabled = false;
        searchBtn.innerText = originalText;
    }
}

/**
 * Función auxiliar para el mapeo de datos en el formulario.
 */
function fillFormWithData(bookInfo) {
    document.getElementById('synopsis').value = bookInfo.description || '';
    document.getElementById('publisher').value = bookInfo.publisher || '';
    document.getElementById('year').value = bookInfo.publishedDate ? bookInfo.publishedDate.split('-')[0] : '';
}

/**
 * Obtención y renderizado de autoras en el control de selección.
 */
function fetchAuthors() {
    fetch('/api/authors')
        .then(res => res.json())
        .then(authors => {
            const select = document.getElementById('author_select');
            if (!select) return;
            select.innerHTML = '<option value="">Selecciona una autora...</option>';
            authors.forEach(a => {
                select.innerHTML += `<option value="${a.id}">${a.first_name} ${a.last_name}</option>`;
            });
        });
}

/**
 * Control de visibilidad del componente de registro de autoras.
 */
function toggleNewAuthorForm() {
    const div = document.getElementById('new-author-section');
    const isVisible = (div.style.display === 'block');
    div.style.display = isVisible ? 'none' : 'block';
    div.setAttribute('aria-expanded', !isVisible);
}

/**
 * Persistencia de entidades de tipo Autora.
 */
async function saveAuthor() {
    const id = document.getElementById('edit-author-id')?.value; 
    const first_name = document.getElementById('new-author-first-name').value;
    const last_name = document.getElementById('new-author-last-name').value;
    const country = document.getElementById('new-author-country').value;
    const bio = document.getElementById('new-author-bio').value;

    if (!first_name || !last_name) {
        showToast("Error: Campos obligatorios incompletos", "error");
        return;
    }

    const url = id ? `/api/authors/${id}` : '/api/authors';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ first_name, last_name, country, bio })
        });

        if (res.ok) {
            showToast("Datos de autora persistidos correctamente", "success");
            resetAuthorForm();
            document.getElementById('new-author-section').style.display = 'none';
            fetchAuthors();
        }
    } catch (err) {
        console.error("Error API saveAuthor:", err);
    }
}

/**
 * Reinicio del estado del formulario de autoras.
 */
function resetAuthorForm() {
    document.getElementById('edit-author-id').value = '';
    document.getElementById('new-author-first-name').value = '';
    document.getElementById('new-author-last-name').value = '';
    document.getElementById('new-author-country').value = '';
    document.getElementById('new-author-bio').value = '';
    
    const titleH3 = document.querySelector('#new-author-section h3');
    if(titleH3) titleH3.innerText = "Datos de la Autora";
}

/**
 * Recuperación de datos de autora para procesos de actualización.
 */
async function loadAuthorDataForEdit() {
    const authorId = document.getElementById('author_select').value;
    if (!authorId) {
        showToast("Error: Selección de autora requerida", "error");
        return;
    }

    try {
        const res = await fetch('/api/authors');
        const authors = await res.json();
        const author = authors.find(a => a.id == authorId);

        if (author) {
            document.getElementById('new-author-section').style.display = 'block';
            document.getElementById('edit-author-id').value = author.id;
            document.getElementById('new-author-first-name').value = author.first_name;
            document.getElementById('new-author-last-name').value = author.last_name;
            document.getElementById('new-author-country').value = author.country;
            document.getElementById('new-author-bio').value = author.bio || '';
            document.querySelector('#new-author-section h3').innerText = `Editando: ${author.first_name} ${author.last_name}`;
        }
    } catch (err) {
        console.error("Error API loadAuthorDataForEdit:", err);
    }
}

/**
 * Reinicio del estado del formulario de obras.
 */
function resetBookForm() {
    const bookForm = document.getElementById('book-form');
    if (bookForm) bookForm.reset();
    
    document.getElementById('book-id').value = '';
    const formTitle = document.getElementById('form-title');
    formTitle.innerText = "Gestión de Obras";
    formTitle.removeAttribute('aria-live');
    
    document.getElementById('btn-submit').innerText = "Guardar Libro";
    document.getElementById('btn-cancel').style.display = "none";
}

/**
 * Sistema de notificaciones asíncronas (Toast).
 * Provee retroalimentación no bloqueante al usuario.
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : '✕';
    
    toast.innerHTML = `
        <span style="font-weight: bold;">${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 500);
    }, 3000);
}