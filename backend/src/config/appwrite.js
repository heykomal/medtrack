import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const databases = new Databases(client);
export const DB_ID = process.env.APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  USERS: process.env.APPWRITE_USERS_COLLECTION_ID,
  DISEASES: process.env.APPWRITE_DISEASES_COLLECTION_ID,
  PRESCRIPTIONS: process.env.APPWRITE_PRESCRIPTIONS_COLLECTION_ID,
  MEDICINES: process.env.APPWRITE_MEDICINES_COLLECTION_ID,
  DOSE_LOGS: process.env.APPWRITE_DOSE_LOGS_COLLECTION_ID,
};
