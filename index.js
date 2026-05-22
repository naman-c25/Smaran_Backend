const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const memoryRoutes = require('./routes/memory');
app.use('/memory', memoryRoutes);

app.get('/', (req, res) => res.send('Smaran backend running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));