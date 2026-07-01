import express from 'express';
import { databases, DB_ID, COLLECTIONS } from '../config/appwrite.js';
import { ID, Query } from 'node-appwrite';

const router = express.Router();

// GET all dose logs, optional filters: ?medicineid=&date=&patientname=
router.get('/', async (req, res) => {
  try {
    const { medicineid, date, patientname } = req.query;
    const queries = [];
    if (medicineid) queries.push(Query.equal('medicineid', medicineid));
    if (date) queries.push(Query.equal('date', date));
    if (patientname) queries.push(Query.equal('patientname', patientname));
    queries.push(Query.orderDesc('$createdAt'));
    queries.push(Query.limit(200));
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS, queries);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single dose log
router.get('/:id', async (req, res) => {
  try {
    const log = await databases.getDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST mark dose as taken or skipped
router.post('/', async (req, res) => {
  try {
    const { medicineid, medicinename, patientname, date, scheduledtime, status, note } = req.body;
    if (!medicineid || !date || !scheduledtime || !status) {
      return res.status(400).json({ error: 'medicineid, date, scheduledtime, status are required' });
    }

    // Check for duplicate log on same medicine+date+time
    const existing = await databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS, [
      Query.equal('medicineid', medicineid),
      Query.equal('date', date),
      Query.equal('scheduledtime', scheduledtime),
    ]);
    if (existing.total > 0) {
      // Update existing log instead of creating duplicate
      const updated = await databases.updateDocument(
        DB_ID, COLLECTIONS.DOSE_LOGS, existing.documents[0].$id,
        { status, note: note || '' }
      );
      return res.json(updated);
    }

    const log = await databases.createDocument(
      DB_ID, COLLECTIONS.DOSE_LOGS, ID.unique(),
      { medicineid, medicinename: medicinename || '', patientname: patientname || '', date, scheduledtime, status, note: note || '' }
    );
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update a dose log
router.put('/:id', async (req, res) => {
  try {
    const log = await databases.updateDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id, req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a dose log
router.delete('/:id', async (req, res) => {
  try {
    await databases.deleteDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id);
    res.json({ message: 'Dose log deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
