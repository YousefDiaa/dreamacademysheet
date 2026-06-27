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
  if (req.method !== "GET") return res.status(405).end();

  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, error: "البريد الإلكتروني مطلوب" });

  const normalizedEmail = (email as string).trim().toLowerCase();

  try {
    const collection = await getCollection();
    let student: any = await collection.findOne({ email: normalizedEmail });

    if (!student) {
      const mock = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
      if (mock) {
        await collection.insertOne({ ...mock, email: normalizedEmail });
        student = { ...mock };
      }
    }

    if (!student) return res.status(404).json({ success: false, error: "الطالب غير موجود" });

    const { _id, ...clean } = student as any;
    return res.json({ success: true, student: clean });
  } catch (err) {
    const mock = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
    if (!mock) return res.status(404).json({ success: false, error: "الطالب غير موجود" });
    return res.json({ success: true, student: mock });
  }
}
