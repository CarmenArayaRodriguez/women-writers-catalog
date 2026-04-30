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
        const { title, author_id, short_description, synopsis, publisher, year, genre } = req.body;
        const newBook = await prisma.books.create({
            data: {
                title, short_description, synopsis, publisher,
                year: parseInt(year), genre,
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
    const { id } = req.params;
    const { title, author_id, short_description, synopsis, publisher, year, genre } = req.body;
    const updateData = { 
        title, short_description, synopsis, publisher, 
        year: parseInt(year), genre, 
        authors: { connect: { id: author_id } } 
    };
    if (req.file) updateData.cover_image_url = req.file.filename;
    const result = await prisma.books.update({ where: { id }, data: updateData });
    res.json(result);
});

app.delete('/api/books/:id', authenticateToken, async (req, res) => {
    await prisma.books.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

/**
 * Configuración de servidor HTTPS
 */
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

const PORT = process.env.PORT || 3000;

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🚀 Servidor activo en: https://localhost:${PORT}`);
});