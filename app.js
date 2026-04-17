require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());

/* Configuración de almacenamiento para imágenes de portadas */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/images/'); 
    },
    filename: (req, file, cb) => {
        const title = req.body.title || 'book';
        
        /* Normalización de caracteres para nombres de archivo compatibles */
        const cleanName = title
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');

        cb(null, cleanName + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/* Servidor de archivos estáticos para el frontend */
app.use(express.static(path.join(__dirname, './')));

/* Configuración del pool de conexión a PostgreSQL */
const pool = new Pool({
    user: process.env.APP_DB_USER,      
    host: process.env.APP_DB_HOST,      
    database: process.env.APP_DB_NAME,  
    password: process.env.APP_DB_PASSWORD, 
    port: process.env.APP_DB_PORT,      
});

/* Comprobación inicial de disponibilidad de la base de datos */
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error('❌ ERROR DE CONEXIÓN:', err.message);
    else console.log('✅ CONEXIÓN EXITOSA: Base de datos lista.');
});

/* --- API ENDPOINTS --- */

/* Obtiene el listado completo de autoras */
app.get('/api/authors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM authors ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener autoras: ' + err.message });
    }
});

/* Registra una nueva autora en la base de datos */
app.post('/api/authors', async (req, res) => {
    try {
        const { name, country, bio } = req.body;
        const result = await pool.query(
            'INSERT INTO authors (name, country, bio) VALUES ($1, $2, $3) RETURNING id',
            [name, country, bio]
        );
        res.status(201).json({ id: result.rows[0].id, success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear autora: ' + err.message });
    }
});

/* Actualiza la información de una autora existente */
app.put('/api/authors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country, bio } = req.body;
        await pool.query(
            'UPDATE authors SET name=$1, country=$2, bio=$3 WHERE id=$4',
            [name, country, bio, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar autora: ' + err.message });
    }
});

/* Obtiene libros incluyendo el nombre de la autora mediante un JOIN */
app.get('/api/books', async (req, res) => {
    try {
        const query = `
            SELECT books.*, authors.name as author_name 
            FROM books 
            JOIN authors ON books.author_id = authors.id
            ORDER BY authors.name ASC`; 
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener libros: ' + err.message });
    }
});

/* Obtiene la información detallada de un libro por su ID */
app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT books.*, authors.name as author_name, authors.country as author_country
            FROM books 
            JOIN authors ON books.author_id = authors.id 
            WHERE books.id = $1`;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Libro no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el libro: ' + err.message });
    }
});

/* Crea un nuevo libro procesando el archivo de imagen adjunto */
app.post('/api/books', upload.single('cover_file'), async (req, res) => {
    try {
        const { title, author_id, short_description, synopsis, publisher, year, genre } = req.body;
        const coverImageUrl = req.file ? req.file.filename : 'default.jpg';
        
        const query = `
            INSERT INTO books (title, author_id, short_description, synopsis, publisher, year, genre, cover_image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        
        const result = await pool.query(query, [title, author_id, short_description, synopsis, publisher, year, genre, coverImageUrl]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar libro: ' + err.message });
    }
});

/* Actualiza un libro y gestiona si se subió una nueva imagen o se mantiene la anterior */
app.put('/api/books/:id', upload.single('cover_file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author_id, short_description, synopsis, publisher, year, genre } = req.body;
        
        let query;
        let params;

        if (req.file) {
            query = `UPDATE books SET title=$1, author_id=$2, short_description=$3, synopsis=$4, publisher=$5, year=$6, genre=$7, cover_image_url=$8 WHERE id=$9 RETURNING *`;
            params = [title, author_id, short_description, synopsis, publisher, year, genre, req.file.filename, id];
        } else {
            query = `UPDATE books SET title=$1, author_id=$2, short_description=$3, synopsis=$4, publisher=$5, year=$6, genre=$7 WHERE id=$8 RETURNING *`;
            params = [title, author_id, short_description, synopsis, publisher, year, genre, id];
        }

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar libro: ' + err.message });
    }
});

/* Elimina un registro de libro de la base de datos */
app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM books WHERE id = $1', [id]);
        res.json({ message: "Libro eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar libro: ' + err.message });
    }
});

/* Ejecución del servidor Express */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});