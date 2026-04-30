/**
 * Inicialización de eventos y carga de datos administrativos
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchAuthors();
    loadBooksTable();
    setupEventListeners();
});

/**
 * Configuración de escuchadores de eventos
 */
function setupEventListeners() {
    const bookForm = document.getElementById('book-form');
    const linkLogout = document.getElementById('linkLogout');

    /** Gestión de envío del formulario de libros */
    if (bookForm) {
        bookForm.addEventListener('submit', handleBookSubmit);
    }

    /** Gestión de cierre de sesión */
    if (linkLogout) {
        linkLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
}

/**
 * Procesamiento de creación y actualización de libros
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
            alert(bookId ? "Registro actualizado" : "Registro creado");
            resetBookForm();
            loadBooksTable();
        }
    } catch (err) {
        console.error("Error API handleBookSubmit:", err);
    }
}

/**
 * Renderizado de tabla de gestión de libros
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
 * Carga de datos de libro en formulario para edición
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
 * Eliminación de registro de libro
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
 * Obtención y carga de autoras en selector
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
 * Control de visualización del formulario de autoras
 */
function toggleNewAuthorForm() {
    const div = document.getElementById('new-author-section');
    const isVisible = (div.style.display === 'block');
    div.style.display = isVisible ? 'none' : 'block';
    div.setAttribute('aria-expanded', !isVisible);
}

/**
 * Persistencia de datos de autora (Creación/Edición)
 */
async function saveAuthor() {
    const id = document.getElementById('edit-author-id')?.value; 
    const first_name = document.getElementById('new-author-first-name').value;
    const last_name = document.getElementById('new-author-last-name').value;
    const country = document.getElementById('new-author-country').value;
    const bio = document.getElementById('new-author-bio').value;

    if (!first_name || !last_name) return alert("Nombre y apellido requeridos");

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
            alert("Datos de autora guardados");
            resetAuthorForm();
            document.getElementById('new-author-section').style.display = 'none';
            fetchAuthors();
        }
    } catch (err) {
        console.error("Error API saveAuthor:", err);
    }
}

/**
 * Restablecimiento de formulario de autoras
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
 * Carga de datos de autora para edición
 */
async function loadAuthorDataForEdit() {
    const authorId = document.getElementById('author_select').value;
    if (!authorId) return alert("Seleccione una autora de la lista");

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
 * Restablecimiento de formulario de libros
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