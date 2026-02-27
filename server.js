const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
