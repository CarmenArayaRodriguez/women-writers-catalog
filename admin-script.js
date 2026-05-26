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
 * Procesamiento de persistencia (creación y actualización) de libros con control de duplicados y faltas de ortografía (Español)
 */
async function handleBookSubmit(e) {
    e.preventDefault();
    const bookId = document.getElementById('book-id').value;
    const title = document.getElementById('title').value.trim();
    const authorId = document.getElementById('author_select').value;

    if (!title || !authorId) {
        showToast("Error: Título y Autora son campos obligatorios", "error");
        return;
    }

    if (!bookId) {
        try {
            const resBooks = await fetch('/api/books');
            const books = await resBooks.json();
            
            const resAuthors = await fetch('/api/authors');
            const authors = await resAuthors.json();

            const selectedAuthor = authors.find(a => String(a.id) === String(authorId));
            if (!selectedAuthor) {
                showToast("Error: Autora seleccionada no válida", "error");
                return;
            }

            const exactBookMatch = books.find(b => 
                String(b.author_id) === String(authorId) &&
                b.title.localeCompare(title, 'es', { sensitivity: 'accent' }) === 0
            );

            if (exactBookMatch) {
                showToast(`El libro "${exactBookMatch.title}" ya se encuentra registrado para esta autora`, "error");
                return;
            }

            let highestScore = 0;
            let similarBookMatch = null;

            books.forEach(b => {
                const bookAuthor = b.authors || authors.find(a => String(a.id) === String(b.author_id));
                if (!bookAuthor) return;

                const isSameAuthor = bookAuthor.first_name.localeCompare(selectedAuthor.first_name, 'es', { sensitivity: 'base' }) === 0 &&
                                        bookAuthor.last_name.localeCompare(selectedAuthor.last_name, 'es', { sensitivity: 'base' }) === 0;
                
                if (!isSameAuthor) return;

                const dbTitle = b.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const inputTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                let matchingLettersCount = 0;
                for (let i = 0; i < inputTitle.length; i++) {
                    if (dbTitle.includes(inputTitle[i])) {
                        matchingLettersCount++;
                    }
                }

                const matchScore = (matchingLettersCount / inputTitle.length) * 100;
                
                if (matchScore >= 80 && matchScore > highestScore) {
                    highestScore = matchScore;
                    similarBookMatch = b;
                }
            });

            if (similarBookMatch) {
                openBookCheckModal(
                    similarBookMatch,
                    () => {
                        resetBookForm();
                        showToast("Se mantuvo el registro existente de la obra", "success");
                    },
                    () => {
                        proceedToSaveBook(bookId);
                    }
                );
                return;
            }

        } catch (err) {
            console.error("Error crítico en el validador de duplicidad de libros:", err);
        }
    }

    proceedToSaveBook(bookId);
}

/**
 * Función auxiliar interna que ejecuta el FETCH real enviando el FormData al Backend
 */
async function proceedToSaveBook(bookId) {
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('isbn', document.getElementById('book-isbn-input')?.value || '');
    formData.append('author_id', document.getElementById('author_select').value);
    formData.append('short_description', document.getElementById('short_description').value);
    formData.append('synopsis', document.getElementById('synopsis').value);
    formData.append('publisher', document.getElementById('publisher').value);
    formData.append('year', document.getElementById('year').value);
    formData.append('genre', document.getElementById('genre').value);

    const coverInput = document.getElementById('cover_file');
    if (coverInput && coverInput.files[0]) {
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
        console.error("Error API al intentar guardar el libro en proceedToSaveBook:", err);
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

    if (document.getElementById('book-isbn-input')) {
        document.getElementById('book-isbn-input').value = b.isbn || '';
    }

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
    } catch (err) {
        console.error("Anomalía: Error al cargar la configuración de la API:", err);
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
 * Persistencia de entidades de tipo Autora con control interactivo de duplicados
 */
async function saveAuthor() {
    const id = document.getElementById('edit-author-id')?.value; 
    const first_name = document.getElementById('new-author-first-name').value.trim();
    const last_name = document.getElementById('new-author-last-name').value.trim();
    const country = document.getElementById('new-author-country').value;
    const bio = document.getElementById('new-author-bio').value;

    if (!first_name || !last_name) {
        showToast("Error: Campos obligatorios incompletos", "error");
        return;
    }

    if (!id) {
        try {
            const resAuthors = await fetch('/api/authors');
            const authors = await resAuthors.json();

            const exactMatch = authors.find(a => 
                a.first_name.localeCompare(first_name, 'es', { sensitivity: 'accent' }) === 0 &&
                a.last_name.localeCompare(last_name, 'es', { sensitivity: 'accent' }) === 0
            );

            if (exactMatch) {
                const select = document.getElementById('author_select');
                if (select) select.value = exactMatch.id;
                
                resetAuthorForm();
                document.getElementById('new-author-section').style.display = 'none';
                showToast(`La autora "${exactMatch.first_name} ${exactMatch.last_name}" ya existe en el registro`, "error");
                return; 
            }

            let highestAuthorScore = 0;
            let similarAuthor = null;

            authors.forEach(a => {
                const dbFullName = `${a.first_name} ${a.last_name}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const inputFullName = `${first_name} ${last_name}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                let matchingLettersCount = 0;
                for (let i = 0; i < inputFullName.length; i++) {
                    if (dbFullName.includes(inputFullName[i])) {
                        matchingLettersCount++;
                    }
                }

                const matchScore = (matchingLettersCount / inputFullName.length) * 100;

                if (matchScore >= 80 && matchScore > highestAuthorScore) {
                    highestAuthorScore = matchScore;
                    similarAuthor = a;
                }
            });
            
            if (similarAuthor) {
                openAuthorCheckModal(
                    similarAuthor,
                    () => {
                        const select = document.getElementById('author_select');
                        if (select) select.value = similarAuthor.id;
                        resetAuthorForm();
                        document.getElementById('new-author-section').style.display = 'none';
                        showToast(`Se vinculó la autora existente: ${similarAuthor.first_name}`, "success");
                    },
                    () => {
                        proceedToSaveAuthor({ first_name, last_name, country, bio }, id);
                    }
                );

                const btnForce = document.getElementById('btn-modal-force-create');
                if (btnForce) {
                    btnForce.disabled = false;
                }
                return;
            }

        } catch (err) {
            console.error("Error en el validador de apellidos:", err);
        }
    }

    proceedToSaveAuthor({ first_name, last_name, country, bio }, id);
}

/**
 * Función auxiliar interna que ejecuta el FETCH real hacia el Backend
 */
async function proceedToSaveAuthor(data, id) {
    const url = id ? `/api/authors/${id}` : '/api/authors';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showToast("Datos de autora persistidos correctamente", "success");
            resetAuthorForm();
            if (document.getElementById('new-author-section')) {
                document.getElementById('new-author-section').style.display = 'none';
            }
            if (typeof fetchAuthors === "function") {
                fetchAuthors();
            }
        }
    } catch (err) {
        console.error("Error API proceedToSaveAuthor:", err);
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

/**
 * Buscador Único Inteligente (ISBN o Título)
 */
async function smartSearchInGoogle() {
    const searchInput = document.getElementById('book-search-input');
    const query = searchInput ? searchInput.value.trim() : '';
    const searchBtn = document.getElementById('btn-google-search');

    if (!query) {
        showToast("Error: Ingrese un título o un número ISBN para buscar", "error");
        return;
    }

    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerText = "Cargando...";
    }

    const isIsbn = /^[0-9\- ]+$/.test(query);
    
    const url = isIsbn 
        ? `/api/books/fetch-google/${query.replace(/[- ]/g, "")}` 
        : `/api/books/search-google-title/${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            showToast("No se encontró información para esta obra en el registro externo", "error");
            return;
        }

        const volumeInfo = result.data.volumeInfo || {};

        let foundIsbn = '';
        if (volumeInfo.industryIdentifiers) {
            const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13');
            const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10');
            foundIsbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : '');
        }

        document.getElementById('title').value = volumeInfo.title || '';
        document.getElementById('synopsis').value = volumeInfo.description || '';
        document.getElementById('short_description').value = volumeInfo.description ? volumeInfo.description.substring(0, 150) + '...' : '';
        document.getElementById('publisher').value = volumeInfo.publisher || '';
        document.getElementById('year').value = volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : '';
        document.getElementById('genre').value = volumeInfo.categories ? volumeInfo.categories[0] : '';
        
       if (document.getElementById('book-isbn-input')) {
            document.getElementById('book-isbn-input').value = isIsbn ? query.replace(/[- ]/g, "") : foundIsbn;
        }

        showToast("Información de la obra recuperada con éxito", "success");

    } catch (err) {
        console.error("Error en la búsqueda unificada:", err);
        showToast("Error de comunicación con el servidor local", "error");
    } finally {
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerText = "Buscar";
        }
    }
}

/**
 * Abre el modal de advertencia mostrando detalladamente la autora similar encontrada
 */
function openAuthorCheckModal(existingAuthor, onUseExisting, onForceCreate) {
    const detailsContainer = document.getElementById('modal-author-details');
    
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <strong>${existingAuthor.first_name} ${existingAuthor.last_name}</strong><br>
            <span><strong>País de origen:</strong> ${existingAuthor.country || 'No especificado'}</span><br>
            <p><strong>Biografía:</strong> ${existingAuthor.bio || 'Sin reseña registrada.'}</p>
        `;
    }
    
    const btnUse = document.getElementById('btn-modal-use-existing');
    const btnForce = document.getElementById('btn-modal-force-create');

    if (btnUse) {
        btnUse.onclick = () => {
            onUseExisting();
            closeAuthorCheckModal();
        };
    }

    if (btnForce) {
        btnForce.onclick = () => {
            onForceCreate();
            closeAuthorCheckModal();
        };
    }

    const modal = document.getElementById('author-check-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Cierra el modal de advertencia ocultando el contenedor
 */
function closeAuthorCheckModal() {
    const modal = document.getElementById('author-check-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Abre el modal de advertencia mostrando el libro similar encontrado
 */
function openBookCheckModal(existingBook, onUseExisting, onForceCreate) {
    const detailsContainer = document.getElementById('modal-book-details');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <strong>${existingBook.title}</strong><br>
            <span><strong>Año:</strong> ${existingBook.year || 'No especificado'}</span><br>
            <p><strong>Reseña:</strong> ${existingBook.short_description || 'Sin reseña corta.'}</p>
        `;
    }

    document.getElementById('btn-modal-use-existing-book').onclick = () => {
        onUseExisting();
        closeBookCheckModal();
    };

    document.getElementById('btn-modal-force-create-book').onclick = () => {
        onForceCreate();
        closeBookCheckModal();
    };

    const modal = document.getElementById('book-check-modal');
    if (modal) modal.style.display = 'flex';
}

/**
 * Cierra el modal de libros
 */
function closeBookCheckModal() {
    const modal = document.getElementById('book-check-modal');
    if (modal) modal.style.display = 'none';
}