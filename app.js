/**
 * Dependencias y configuración de entorno
 */
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');

const app = express();

/**
 * Middlewares de seguridad y parsing
 */
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

/**
 * Middleware de autenticación JWT
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
};

/**
 * Configuración de almacenamiento para imágenes (Multer)
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        cb(null, 'assets/images/'); 
    },
    filename: (req, file, cb) => {
        const title = req.body.title || 'book';
        const cleanName = title.toLowerCase()
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

/**
 * API Endpoints: Autenticación
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
    } catch (err) { 
        res.status(500).json({ error: 'Error interno de autenticación' }); 
    }
});

/**
 * API Endpoints: Autores
 */
app.get('/api/authors', async (req, res) => {
    const authors = await prisma.authors.findMany({ orderBy: { first_name: 'asc' } });
    res.json(authors);
});

app.post('/api/authors', authenticateToken, async (req, res) => {
    const { first_name, last_name, country, bio } = req.body;
    const newAuthor = await prisma.authors.create({ data: { first_name, last_name, country, bio } });
    res.status(201).json({ id: newAuthor.id, success: true });
});

app.put('/api/authors/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, country, bio } = req.body;
    await prisma.authors.update({ where: { id }, data: { first_name, last_name, country, bio } });
    res.json({ success: true });
});

/**
 * API Endpoints: Libros
 */
app.get('/api/books', async (req, res) => {
    const books = await prisma.books.findMany({ include: { authors: true }, orderBy: { title: 'asc' } });
    res.json(books);
});

app.get('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const book = await prisma.books.findUnique({ where: { id }, include: { authors: true } });
    if (!book) return res.status(404).json({ error: 'Recurso no encontrado' });
    res.json(book);
});

app.post('/api/books', authenticateToken, upload.single('cover_file'), async (req, res) => {
    try {
        const { title, isbn, author_id, short_description, synopsis, publisher, year, genre } = req.body;

        const sanitizedIsbn = isbn && isbn.trim() !== '' ? isbn.replace(/[- ]/g, "").trim() : null;

        const newBook = await prisma.books.create({
            data: {
                title,
                isbn: sanitizedIsbn, 
                short_description,
                synopsis,
                publisher,
                year: parseInt(year),
                genre,
                cover_image_url: req.file ? req.file.filename : 'default.jpg',
                authors: { connect: { id: author_id } }
            }
        });
        res.status(201).json(newBook);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

app.put('/api/books/:id', authenticateToken, upload.single('cover_file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, isbn, author_id, short_description, synopsis, publisher, year, genre } = req.body;
        
        const sanitizedIsbn = isbn && isbn.trim() !== '' ? isbn.replace(/[- ]/g, "").trim() : null;

        const updateData = { 
            title,
            isbn: sanitizedIsbn, 
            short_description,
            synopsis,
            publisher, 
            year: parseInt(year),
            genre, 
            authors: { connect: { id: author_id } } 
        };
        
        if (req.file) updateData.cover_image_url = req.file.filename;
        
        const result = await prisma.books.update({ where: { id }, data: updateData });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/books/:id', authenticateToken, async (req, res) => {
    await prisma.books.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

/**
 * API Endpoint: Consulta externa de metadatos por TÍTULO 
 * Realiza una petición a Google Books por título y devuelve el primer volumen crudo sin filtros.
 */
app.get('/api/books/search-google-title/:title', authenticateToken, async (req, res) => {
    const { title } = req.params;

    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}${apiKey ? `&key=${apiKey}` : ''}`;
        
        const apiResponse = await fetch(googleUrl);
        const searchResult = await apiResponse.json();

        if (!searchResult.items || searchResult.items.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No se encontraron metadatos para este título en Google Books.' 
            });
        }

        res.json({ success: true, data: searchResult.items[0] });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al comunicarse con el servicio externo de Google Books.',
            details: err.message 
        });
    }
});

/**
 * API Endpoint: Consulta externa de metadatos por ISBN 
 * Realiza una petición a Google Books por ISBN y devuelve el volumen crudo sin filtros.
 */
app.get('/api/books/fetch-google/:isbn', authenticateToken, async (req, res) => {
    const { isbn } = req.params;
    const cleanIsbn = isbn.replace(/[- ]/g, "").trim();

    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}${apiKey ? `&key=${apiKey}` : ''}`;
        
        const apiResponse = await fetch(googleUrl);
        const searchResult = await apiResponse.json();

        if (!searchResult.items || searchResult.items.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No se encontraron metadatos para este ISBN en Google Books.' 
            });
        }

        res.json({ success: true, data: searchResult.items[0] });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al comunicarse con el servicio externo de Google Books.',
            details: err.message 
        });
    }
});

/**
 * Configuración de servidor HTTPS
 */
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

const PORT = process.env.PORT || 3000;

/**
 * API Endpoints: Configuración del Sistema
 * Proporciona acceso controlado a variables de entorno para la integración de APIs externas.
 */
app.get('/api/config/google-books', (req, res) => {
    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Configuración de API no detectada en el entorno.' });
        }
        res.json({ apiKey });
    } catch (err) {
        res.status(500).json({ error: 'Error al recuperar la configuración.' });
    }
});

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🚀 Servidor activo en: https://localhost:${PORT}`);
});