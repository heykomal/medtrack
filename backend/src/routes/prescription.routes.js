import express from 'express';
import { databases, DB_ID, COLLECTIONS } from '../config/appwrite.js';
import { ID, Query } from 'node-appwrite';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { diseaseid, patientname, doctornote, startdate, enddate } = req.body;
    const prescription = await databases.createDocument(
      DB_ID, COLLECTIONS.PRESCRIPTIONS, ID.unique(),
      { diseaseid, patientname, doctornote, startdate, enddate, active: true }
    );
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.PRESCRIPTIONS);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await databases.getDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id);
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const prescription = await databases.updateDocument(
      DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id, req.body
    );
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await databases.deleteDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
