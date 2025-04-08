const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
// const PORT = 5000;
const PORT = process.env.PORT || 5000;

// const uri = "mongodb+srv://CamaRus:rkk_1991@cluster0.cussnjf.mongodb.net/?appName=Cluster0";
// const client = new MongoClient(uri);
const client = new MongoClient(process.env.MONGODB_URI);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let notesCollection;

// Подключение к базе данных
async function connectDB() {
    try {
        await client.connect();
        const db = client.db('notesApp');
        notesCollection = db.collection('notes');
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ DB connection error:', err);
    }
}

// Получить все заметки
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await notesCollection.find({}).toArray();
        res.json(notes);
    } catch (err) {
        res.status(500).send('Error fetching notes');
    }
});

// Добавить новую заметку
app.post('/api/notes', async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).send('Missing fields');

    try {
        const result = await notesCollection.insertOne({ title, content });
        res.status(201).json({ _id: result.insertedId, title, content });
    } catch (err) {
        res.status(500).send('Error creating note');
    }
});

// Удалить заметку
app.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    try {
        await notesCollection.deleteOne({ _id: new ObjectId(noteId) });
        res.status(200).send('Note deleted');
    } catch (err) {
        res.status(500).send('Error deleting note');
    }
});

// Обновить заметку
app.put('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Missing fields');
    }

    try {
        const result = await notesCollection.updateOne(
            { _id: new ObjectId(noteId) },
            { $set: { title, content } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).send('Note updated');
        } else {
            res.status(404).send('Note not found');
        }
    } catch (err) {
        res.status(500).send('Error updating note');
    }
});


// Старт сервера
app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});