/* Configuración inicial de eventos y carga de datos al iniciar el DOM */
document.addEventListener('DOMContentLoaded', () => {
    fetchAuthors();
    loadBooksTable();

    const bookForm = document.getElementById('book-form');

    bookForm.addEventListener('submit', async (e) => {
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
            const res = await fetch(url, { method, body: formData });
            if (res.ok) {
                alert(bookId ? "¡Obra actualizada!" : "¡Obra creada!");
                resetBookForm();
                loadBooksTable();
            }
        } catch (err) {
            console.error("Error en el servidor:", err);
        }
    });
});

/* Obtención de libros desde la API y renderizado en la tabla administrativa */
async function loadBooksTable() {
    const res = await fetch('/api/books');
    const books = await res.json();
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    books.forEach(b => {
        const row = `
            <tr>
                <td><img src="assets/images/${b.cover_image_url}" width="40" class="img-mini"></td>
                <td>${b.title}</td>
                <td>${b.author_name}</td>
                <td>
                    <button class="btn-edit" onclick="prepareBookEdit('${b.id}')">Editar</button>
                    <button class="btn-delete" onclick="deleteBook('${b.id}', '${b.title}', '${b.author_name}')">Borrar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

/* Carga de datos de un libro en el formulario para su edición */
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

    document.getElementById('form-title').innerText = "Editando: " + b.title;
    document.getElementById('btn-submit').innerText = "Guardar Cambios";
    document.getElementById('btn-cancel').style.display = "inline-block";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Solicitud de eliminación de un registro tras confirmación del usuario */
async function deleteBook(id, title, author) {
    if (confirm(`¿Estás segura de que quieres eliminar "${title}" de ${author}?`)) {
        const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadBooksTable();
        }
    }
}

/* Actualización del selector de autoras con datos de la API */
function fetchAuthors() {
    fetch('/api/authors').then(res => res.json()).then(authors => {
        const select = document.getElementById('author_select');
        select.innerHTML = '<option value="">Selecciona una autora...</option>';
        authors.forEach(a => {
            select.innerHTML += `<option value="${a.id}">${a.name}</option>`;
        });
    });
}

/* Control de visibilidad del formulario secundario de autoras */
function toggleNewAuthorForm() {
    const div = document.getElementById('new-author-section');
    div.style.display = div.style.display === 'none' ? 'block' : 'none';
}

/* Gestión de persistencia para creación o actualización de autoras */
async function saveAuthor() {
    const id = document.getElementById('edit-author-id')?.value; 
    const name = document.getElementById('new-author-name').value;
    const country = document.getElementById('new-author-country').value;
    const bio = document.getElementById('new-author-bio').value;

    if (!name) return alert("Escribe el nombre de la autora");

    const url = id ? `/api/authors/${id}` : '/api/authors';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, country, bio })
        });

        if (res.ok) {
            alert(id ? "¡Autora actualizada con éxito!" : "¡Autora creada con éxito!");
            
            document.getElementById('edit-author-id').value = '';
            document.getElementById('new-author-name').value = '';
            document.getElementById('new-author-country').value = '';
            document.getElementById('new-author-bio').value = '';
            
            toggleNewAuthorForm();
            fetchAuthors();
        }
    } catch (err) {
        console.error("Error al guardar autora:", err);
    }
}

/* Restablecimiento del formulario principal de libros a su estado inicial */
function resetBookForm() {
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    document.getElementById('form-title').innerText = "Añadir Nueva Obra";
    document.getElementById('btn-submit').innerText = "Guardar Libro";
    document.getElementById('btn-cancel').style.display = "none";
}

/* Recuperación y despliegue de datos de autora para edición */
async function loadAuthorDataForEdit() {
    const authorId = document.getElementById('author_select').value;
    
    if (!authorId) {
        alert("Primero selecciona una autora de la lista para editarla.");
        return;
    }

    const res = await fetch('/api/authors');
    const authors = await res.json();
    const author = authors.find(a => a.id == authorId);

    if (author) {
        document.getElementById('new-author-section').style.display = 'block';
        document.getElementById('edit-author-id').value = author.id;
        document.getElementById('new-author-name').value = author.name;
        document.getElementById('new-author-country').value = author.country;
        document.getElementById('new-author-bio').value = author.bio || '';

        document.querySelector('#new-author-section h3').innerText = "Editando a: " + author.name;
    }
}