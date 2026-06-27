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

  const { email, lessonId, done } = req.body;
  if (!email || !lessonId) {
    return res.status(400).json({ success: false, error: "البيانات المدخلة غير مكتملة" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const collection = await getCollection();
    let student: any = await collection.findOne({ email: normalizedEmail });

    if (!student) {
      const mock = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
      if (mock) {
        await collection.insertOne({ ...mock, email: normalizedEmail });
        student = { ...mock, email: normalizedEmail };
      }
    }

    if (!student) {
      return res.status(404).json({ success: false, error: "الطالب غير موجود" });
    }

    let completed: string[] = [...(student.completedLessons || [])];
    if (done) {
      if (!completed.includes(lessonId)) completed.push(lessonId);
    } else {
      completed = completed.filter(id => id !== lessonId);
    }

    await collection.updateOne(
      { email: normalizedEmail },
      { $set: { completedLessons: completed } },
      { upsert: true }
    );

    return res.json({ success: true, completedLessons: completed });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: `فشل حفظ التقدم: ${err.message}` });
  }
}
