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

// GET dose logs — always filtered to the requesting user
router.get('/', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const { medicineid, date, patientname } = req.query;
    const queries = [Query.equal('useremail', req.userEmail)];
    if (medicineid)  queries.push(Query.equal('medicineid',  medicineid));
    if (date)        queries.push(Query.equal('date',        date));
    if (patientname) queries.push(Query.equal('patientname', patientname));
    queries.push(Query.orderDesc('$createdAt'));
    queries.push(Query.limit(200));
    const result = await databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS, queries);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const log = await databases.getDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id);
    if (log.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST mark dose — upsert pattern (update existing log for same medicine+date+time)
router.post('/', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const { medicineid, medicinename, patientname, date, scheduledtime, status, note } = req.body;
    if (!medicineid || !date || !scheduledtime || !status) {
      return res.status(400).json({ error: 'medicineid, date, scheduledtime, status are required' });
    }

    const existing = await databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS, [
      Query.equal('useremail',     req.userEmail),
      Query.equal('medicineid',    medicineid),
      Query.equal('date',          date),
      Query.equal('scheduledtime', scheduledtime),
    ]);

    if (existing.total > 0) {
      const updated = await databases.updateDocument(
        DB_ID, COLLECTIONS.DOSE_LOGS, existing.documents[0].$id,
        { status, note: note || '' }
      );
      return res.json(updated);
    }

    const log = await databases.createDocument(
      DB_ID, COLLECTIONS.DOSE_LOGS, ID.unique(),
      {
        useremail:    req.userEmail,
        medicineid,
        medicinename: medicinename || '',
        patientname:  patientname  || '',
        date, scheduledtime, status,
        note: note || '',
      }
    );
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id);
    if (existing.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    const log = await databases.updateDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id, req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  if (!requireUser(req, res)) return;
  try {
    const existing = await databases.getDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id);
    if (existing.useremail !== req.userEmail) return res.status(403).json({ error: 'Forbidden' });
    await databases.deleteDocument(DB_ID, COLLECTIONS.DOSE_LOGS, req.params.id);
    res.json({ message: 'Dose log deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
