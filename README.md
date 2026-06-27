<div align="center">
  <img src="https://img.shields.io/badge/Made_by-Yousef_Diaa_El_Dennn-indigo?style=for-the-badge" alt="Made by" />
  <h1>كراسة 📚</h1>
  <p><strong>منصة التتبع المتقدم لإنجاز المناهج الدراسية</strong></p>
  <p>Advanced Curriculum Tracking Platform built for modern education.</p>
</div>

<br />

## 🌟 مميزات المنصة (Features)

### 👨‍🏫 لوحة تحكم المعلم وإدارة الأكاديمية (Teacher & Admin Dashboard)
- **متابعة دقيقة (Granular Tracking):** فلترة الطلاب ومراقبة تقدمهم حسب المادة، الوحدة، الفصل، أو الدرس (Subject > Unit > Chapter > Lesson).
- **الفرز الذكي (Smart Sorting):** إبراز الطلاب المنجزين أو المتقاعسين في بداية القائمة تلقائياً لتسهيل المتابعة.
- **إدارة الانضباط (Disciplinary Management):** تسجيل التنبيهات السلوكية وحالات التأخير للطلاب وتحديثها فورياً في قواعد البيانات.
- **إحصائيات شاملة:** عرض مؤشرات الأداء الكلية ونسب الإنجاز لكل طالب في جداول احترافية.

### 👨‍🎓 بوابة الطالب (Student Portal)
- **واجهة تفاعلية وجذابة:** تصميم عصري وحديث مستوحى من أفضل التطبيقات العالمية (Glassmorphism, Dark Mode) لراحة العين وتشجيع التعلم.
- **تتبع الإنجاز (Progress Tracking):** استعراض المناهج التعليمية كشجرة تفاعلية وحساب النسب المئوية للإنجاز لكل مادة أو وحدة تلقائياً.
- **مزامنة فورية (Optimistic UI):** حفظ مستوى التقدم في قاعدة البيانات السحابية (MongoDB) بصورة فورية مع توفر نظام حماية (Fallback) في حال انقطاع الإنترنت.
- **تجاوب كامل (Fully Responsive):** تجربة استخدام مثالية ومحسّنة بالكامل لأجهزة الجوال (شريط تمرير أفقي للمواد)، الأجهزة اللوحية، والشاشات الكبيرة.

## 💻 التقنيات المستخدمة (Tech Stack)

- **الواجهة الأمامية (Frontend):** React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **الخادم (Backend):** Node.js, Express.js
- **قاعدة البيانات (Database):** MongoDB (Cloud Atlas)

## 🚀 كيفية التشغيل والاستضافة (Getting Started)

### 1. المتطلبات الأساسية (Prerequisites)
- [Node.js](https://nodejs.org/) الإصدار 18 أو أعلى.
- حساب [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) لإنشاء قاعدة بيانات سحابية.

### 2. التثبيت (Installation)
قم باستنساخ المستودع وتثبيت الحزم:
```bash
git clone https://github.com/YousefDiaa/dreamacademysheet.git
cd dreamacademysheet
npm install
```

### 3. إعدادات البيئة (Environment Variables)
قم بإنشاء ملف `.env` في المسار الجذري للمشروع وأضف الرابط الخاص بقاعدة بيانات MongoDB:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
PORT=3000
```

### 4. التشغيل (Run)
شغل خادم التطوير (يتضمن كلاً من الواجهة الأمامية والخادم في أمر واحد):
```bash
npm run dev
```
افتح المتصفح على الرابط: `http://localhost:3000`

---

<div align="center">
  <p>Made with ❤️ by <strong>Yousef Diaa El Dennn</strong></p>
</div>
