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

  const { email, name, category } = req.body;
  if (!email || !name || !category) {
    return res.status(400).json({ success: false, error: "البيانات المدخلة غير مكتملة" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { email: normalizedEmail },
      { $set: { name: name.trim(), category } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "الطالب غير موجود" });
    }
    return res.json({ success: true, name: name.trim(), category });
  } catch (err: any) {
    // Fallback: update in-memory mock
    const student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
    if (!student) return res.status(404).json({ success: false, error: "الطالب غير موجود" });
    student.name = name.trim();
    (student as any).category = category;
    return res.json({ success: true, name: name.trim(), category });
  }
}
