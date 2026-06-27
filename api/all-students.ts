import { MongoClient } from "mongodb";
import { MOCK_STUDENTS } from "../../src/data/mockStudents.js";

let client: MongoClient | null = null;

async function getCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  if (!client) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
  }
  return client.db("curriculum_tracker").collection("students");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const collection = await getCollection();
    const all = await collection.find({}).toArray();
    const sanitized = all.map(({ password, _id, ...s }) => s);
    return res.json({ success: true, students: sanitized });
  } catch (err) {
    // Fallback to mock data
    const sanitized = MOCK_STUDENTS.map(({ password, ...s }) => s);
    return res.json({ success: true, students: sanitized });
  }
}
