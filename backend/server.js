import express from 'express';
import cors from 'cors';
import { databases, DB_ID, COLLECTIONS } from './src/config/appwrite.js';
import diseaseRoutes from './src/routes/disease.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MedTrack API', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'medtrack-backend', timestamp: new Date().toISOString() });
});

app.get('/test-appwrite', async (req, res) => {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.USERS);
    res.json({ message: 'Appwrite connected successfully', totalUsers: result.total, documents: result.documents });
  } catch (error) {
    res.status(500).json({ message: 'Appwrite connection failed', error: error.message });
  }
});

app.use('/api/diseases', diseaseRoutes);

app.listen(PORT, () => {
  console.log(`MedTrack backend running on port ${PORT}`);
});
