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
    const { prescriptionid, patientname, name, dosage, unit, times, instructions } = req.body;
    const medicine = await databases.createDocument(
      DB_ID, COLLECTIONS.MEDICINES, ID.unique(),
      { useremail: req.userEmail, prescriptionid, patientname, name, dosage, unit, times, instructions, active: true }
    );
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const { prescriptionid } = req.query;
    const queries = [Query.equal('useremail', req.userEmail)];
    if (prescriptionid) queries.push(Query.equal('prescriptionid', prescriptionid));
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.MEDICINES, queries);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const medicine = await databases.getDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id);
    if (medicine.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id);
    if (existing.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    const medicine = await databases.updateDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id, req.body);
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id);
    if (existing.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    await databases.updateDocument(DB_ID, COLLECTIONS.MEDICINES, req.params.id, { active: false });
    res.json({ message: 'Medicine deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
