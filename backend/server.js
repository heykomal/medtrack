import express from 'express';
import cors from 'cors';
import { databases, DB_ID, COLLECTIONS } from './src/config/appwrite.js';
import diseaseRoutes from './src/routes/disease.routes.js';
import prescriptionRoutes from './src/routes/prescription.routes.js';
import medicineRoutes from './src/routes/medicine.routes.js';
import doseLogRoutes from './src/routes/dose-log.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'medtrack-backend', timestamp: new Date().toISOString() });
});

app.get('/test-appwrite', async (req, res) => {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.USERS);
    res.json({ message: 'Appwrite connected', totalUsers: result.total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/diseases', diseaseRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/dose-logs', doseLogRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MedTrack backend running on port ${PORT}`);
});
