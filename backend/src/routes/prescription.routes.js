import express from 'express';
import { databases, DB_ID, COLLECTIONS } from '../config/appwrite.js';
import { ID, Query } from 'node-appwrite';

const router = express.Router();

function requireUser(req, res) {
  if (!req.userEmail) {
    res.status(401).json({ error: 'Missing X-User-Email header' });
    return false;
  }
  return true;
}

router.post('/', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const { diseaseid, patientname, doctornote, startdate, enddate, active } = req.body;
    const prescription = await databases.createDocument(
      DB_ID, COLLECTIONS.PRESCRIPTIONS, ID.unique(),
      { useremail: req.userEmail, diseaseid, patientname, doctornote, startdate, enddate, active: active ?? true }
    );
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.PRESCRIPTIONS, [
      Query.equal('useremail', req.userEmail),
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const prescription = await databases.getDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id);
    if (prescription.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id);
    if (existing.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    const prescription = await databases.updateDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id, req.body);
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id);
    if (existing.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    await databases.deleteDocument(DB_ID, COLLECTIONS.PRESCRIPTIONS, req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
