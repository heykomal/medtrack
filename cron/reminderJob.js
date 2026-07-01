import 'dotenv/config';
import cron from 'node-cron';
import { Client, Databases, ID, Query } from 'node-appwrite';
import { sendReminderEmail, sendDailySummaryEmail } from './emailService.js';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.APPWRITE_DATABASE_ID;
const MEDICINES_COL = process.env.APPWRITE_MEDICINES_COLLECTION_ID;
const DOSE_LOGS_COL = process.env.APPWRITE_DOSE_LOGS_COLLECTION_ID;

function getTodayDate() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getCurrentHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function checkAndSendReminders() {
  const currentTime = getCurrentHHMM();
  const today = getTodayDate();
  console.log(`[${new Date().toISOString()}] Checking reminders for time: ${currentTime}`);

  try {
    // Fetch all active medicines
    const medicinesResult = await databases.listDocuments(DB_ID, MEDICINES_COL, [
      Query.equal('active', true),
      Query.limit(500),
    ]);

    for (const medicine of medicinesResult.documents) {
      const times = medicine.times || [];
      if (!times.includes(currentTime)) continue;

      // Check if dose already logged for today at this time
      const existing = await databases.listDocuments(DB_ID, DOSE_LOGS_COL, [
        Query.equal('medicineid', medicine.$id),
        Query.equal('date', today),
        Query.equal('scheduledtime', currentTime),
      ]);

      if (existing.total > 0) {
        console.log(`  Dose already logged for ${medicine.name} at ${currentTime} — skipping email`);
        continue;
      }

      // Create a pending dose log entry
      await databases.createDocument(DB_ID, DOSE_LOGS_COL, ID.unique(), {
        medicineid: medicine.$id,
        medicinename: medicine.name,
        patientname: medicine.patientname,
        date: today,
        scheduledtime: currentTime,
        status: 'pending',
        note: '',
      });

      // Send email reminder
      const recipientEmail = process.env.PATIENT_EMAIL || process.env.GMAIL_USER;
      try {
        await sendReminderEmail({
          to: recipientEmail,
          patientName: medicine.patientname,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          unit: medicine.unit,
          scheduledTime: currentTime,
        });
        console.log(`  ✉ Reminder sent for ${medicine.name} (${medicine.patientname}) at ${currentTime}`);
      } catch (emailErr) {
        console.error(`  ✗ Email failed for ${medicine.name}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error('Error in reminder job:', err.message);
  }
}

// Daily summary at 21:00 every day
async function sendDailySummary() {
  const today = getTodayDate();
  console.log(`[${new Date().toISOString()}] Sending daily summary for ${today}`);

  try {
    const logsResult = await databases.listDocuments(DB_ID, DOSE_LOGS_COL, [
      Query.equal('date', today),
      Query.limit(500),
    ]);

    const logs = logsResult.documents;
    const taken = logs.filter(l => l.status === 'taken').length;
    const skipped = logs.filter(l => l.status === 'skipped').length;
    const pending = logs.filter(l => l.status === 'pending').length;

    // Group by patient
    const patients = [...new Set(logs.map(l => l.patientname))].filter(Boolean);
    if (patients.length === 0 && logs.length === 0) {
      console.log('  No dose logs found for today, skipping summary.');
      return;
    }

    const recipientEmail = process.env.PATIENT_EMAIL || process.env.GMAIL_USER;
    const patientName = patients[0] || 'Patient';

    await sendDailySummaryEmail({ to: recipientEmail, patientName, date: today, taken, skipped, pending });
    console.log(`  ✉ Daily summary sent to ${recipientEmail}`);
  } catch (err) {
    console.error('Error sending daily summary:', err.message);
  }
}

// Run every minute to check medicine times
cron.schedule('* * * * *', checkAndSendReminders, { timezone: process.env.TZ || 'Asia/Kolkata' });

// Daily summary at 9 PM
cron.schedule('0 21 * * *', sendDailySummary, { timezone: process.env.TZ || 'Asia/Kolkata' });

console.log('MedTrack cron service started. Checking reminders every minute...');

// Run once immediately on startup
checkAndSendReminders();
