import { MongoClient } from "mongodb";
import { MOCK_STUDENTS } from "../src/data/mockStudents.js";

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
  if (req.method !== "POST") return res.status(405).end();

  const { email, warningsCount, latesCount, warningsList, latesList } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "البريد الإلكتروني مطلوب" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { email: normalizedEmail },
      { $set: { warningsCount, latesCount, warningsList, latesList } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "الطالب غير موجود" });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
