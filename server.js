const express = require('express');
const path = require('path');

const app = express();

// Указываем Express.js раздавать статические файлы из папки "public"
app.use(express.static(path.join(__dirname, 'public')));

// Настроим сервер на прослушивание порта 3000
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});