import express from 'express';
import { databases, DB_ID, COLLECTIONS } from '../config/appwrite.js';
import { ID } from 'node-appwrite';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { patientName, diseaseName, description, status, diagnosedDate } = req.body;
    const disease = await databases.createDocument(
      DB_ID,
      COLLECTIONS.DISEASES,
      ID.unique(),
      {
        patientname: patientName,
        diseasename: diseaseName,
        description: description,
        status: status,
        diagnoseDate: diagnosedDate
      }
    );
    res.status(201).json(disease);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.DISEASES);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const disease = await databases.getDocument(DB_ID, COLLECTIONS.DISEASES, req.params.id);
    res.json(disease);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const disease = await databases.updateDocument(
      DB_ID, COLLECTIONS.DISEASES, req.params.id, req.body
    );
    res.json(disease);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await databases.deleteDocument(DB_ID, COLLECTIONS.DISEASES, req.params.id);
    res.json({ message: 'Disease deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
