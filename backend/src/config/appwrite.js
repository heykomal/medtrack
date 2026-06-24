import { Client, Databases, Users } from 'node-appwrite';

// WHY: Initialize Appwrite client once and export it
// All other files import from here — no repeated setup
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const databases = new Databases(client);
export const users = new Users(client);

export const DB_ID = process.env.APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  USERS: process.env.APPWRITE_USERS_COLLECTION_ID,
};
