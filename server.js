const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dataPath = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

const readData = () => JSON.parse(fs.readFileSync(dataPath));
const writeData = data => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
// 👉 ဒီကနေစပြီး ထည့်ပါ
const USERNAME = "admin";
const PASSWORD = "1234";
// LOGIN route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // 💾 Simple hardcoded check
  if (username === 'admin' && password === '1234') {
    res.status(200).json({ message: 'Login success' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});


// GET movies
// ✅ Add GET /api/movies route
app.get("/api/movies", (req, res) => {
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read movies" });
    }
    res.json(JSON.parse(data));
  });
});

// POST new movie
app.post('/api/movies', upload.fields([{ name: 'poster' }, { name: 'video' }]), (req, res) => {
  const { title, description, year, rating } = req.body;
  const poster = req.files.poster?.[0];
  const video = req.files.video?.[0];

  const newMovie = {
    id: Date.now().toString(),
    title, description, year, rating,
    posterUrl: poster ? `/uploads/${poster.filename}` : '',
    videoUrl: video ? `/uploads/${video.filename}` : ''
  };

  const movies = readData();
  movies.push(newMovie);
  writeData(movies);
  res.send('Movie uploaded successfully.');
});

// PUT update
app.put('/api/movies/:id', upload.single('poster'), (req, res) => {
  const { id } = req.params;
  const { title, description, year, rating } = req.body;
  const movies = readData();
  const index = movies.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).send('Movie not found.');

  if (title) movies[index].title = title;
  if (description) movies[index].description = description;
  if (year) movies[index].year = year;
  if (rating) movies[index].rating = rating;
  if (req.file) movies[index].posterUrl = `/uploads/${req.file.filename}`;

  writeData(movies);
  res.send('Movie updated.');
});

// DELETE movie
app.delete('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const movies = readData().filter(m => m.id !== id);
  writeData(movies);
  res.sendStatus(204);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


