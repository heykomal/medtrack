import express from 'express';
import { databases, DB_ID, COLLECTIONS } from '../config/appwrite.js';
import { ID, Query } from 'node-appwrite';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prescriptionid, patientname, name, dosage, unit, times, instructions } = req.body;
    const medicine = await databases.createDocument(
      DB_ID, COLLECTIONS.MEDICINES, ID.unique(),
      { prescriptionid, patientname, name, dosage, unit, times, instructions, active: true }
    );
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { prescriptionid } = req.query;
    const queries = prescriptionid ? [Query.equal('prescriptionid', prescriptionid)] : [];
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.MEDICINES, queries);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const medicine = await databases.getDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id);
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const medicine = await databases.updateDocument(
      DB_ID, COLLECTIONS.MEDICINES, req.params.id, req.body
    );
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await databases.updateDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id, { active: false });
    res.json({ message: 'Medicine deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
