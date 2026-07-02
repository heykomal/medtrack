import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  adminLogin, getStats, getUsers, getUserDetail,
  getDiseases, getPrescriptions, getMedicines, getDoseLogs,
  getAnalytics, getLogs, getSystem,
} from '../controllers/admin.controller.js';

const router = Router();

router.post('/login', adminLogin);   // no auth — public endpoint

router.use(adminAuth);               // everything below requires admin token

router.get('/stats',          getStats);
router.get('/users',          getUsers);
router.get('/users/:email',   getUserDetail);
router.get('/diseases',       getDiseases);
router.get('/prescriptions',  getPrescriptions);
router.get('/medicines',      getMedicines);
router.get('/dose-logs',      getDoseLogs);
router.get('/analytics',      getAnalytics);
router.get('/logs',           getLogs);
router.get('/system',         getSystem);

export default router;
