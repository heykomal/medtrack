// One-time script: creates the collection-dose-logs collection in Appwrite
import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.APPWRITE_DATABASE_ID;
const COL_ID = process.env.APPWRITE_DOSE_LOGS_COLLECTION_ID;

async function setup() {
  console.log('Creating collection:', COL_ID);

  // Create collection
  await databases.createCollection(DB_ID, COL_ID, 'Dose Logs', [
    Permission.read(Role.any()),
    Permission.create(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
  ]);
  console.log('Collection created.');

  // Create attributes (Appwrite creates them async — add sequentially with small gaps)
  const attrs = [
    () => databases.createStringAttribute(DB_ID, COL_ID, 'medicineid',   255, true),
    () => databases.createStringAttribute(DB_ID, COL_ID, 'medicinename', 255, false, ''),
    () => databases.createStringAttribute(DB_ID, COL_ID, 'patientname',  255, false, ''),
    () => databases.createStringAttribute(DB_ID, COL_ID, 'date',          20, true),
    () => databases.createStringAttribute(DB_ID, COL_ID, 'scheduledtime', 10, true),
    () => databases.createStringAttribute(DB_ID, COL_ID, 'status',        20, true),
    () => databases.createStringAttribute(DB_ID, COL_ID, 'note',        1000, false, ''),
  ];

  for (const fn of attrs) {
    const attr = await fn();
    console.log('Attribute created:', attr.key);
    await new Promise(r => setTimeout(r, 500)); // small delay for Appwrite to process
  }

  console.log('All attributes created. Waiting for indexes to be ready...');
  await new Promise(r => setTimeout(r, 3000));

  // Create index on date for fast querying
  await databases.createIndex(DB_ID, COL_ID, 'idx_date', 'key', ['date']);
  console.log('Index on date created.');

  console.log('\nDone! collection-dose-logs is ready.');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
