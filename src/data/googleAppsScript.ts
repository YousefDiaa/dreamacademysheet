export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * كود Google Apps Script لمنصة متابعة المناهج الدراسية
 * قم بإنشاء جدول بيانات Google Sheet بالاسم الذي تريده، ثم اذهب إلى:
 * Extensions (الإضافات) -> Apps Script
 * واستبدل الكود هناك بهذا الكود بالكامل، ثم اضغط على "Deploy" -> "New deployment" كـ "Web app"
 * واختر Access: "Anyone" (أي شخص).
 */

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// دالة تهيئة الجداول إذا لم تكن موجودة
function setupDatabase() {
  let studentsSheet = SPREADSHEET.getSheetByName("Students");
  if (!studentsSheet) {
    studentsSheet = SPREADSHEET.insertSheet("Students");
    studentsSheet.appendRow(["Email", "Password", "Name", "WarningsCount", "LatesCount", "WarningsList", "LatesList"]);
    // إضافة حساب تجريبي
    studentsSheet.appendRow([
      "student@example.com", 
      "123456", 
      "أحمد محمد علي", 
      "1", 
      "2", 
      "الرجاء التركيز أكثر في حصة الفيزياء", 
      "تأخر عن طابور الصباح يوم الأحد|تأخر عن حصة الكيمياء"
    ]);
  }
  
  let progressSheet = SPREADSHEET.getSheetByName("Progress");
  if (!progressSheet) {
    progressSheet = SPREADSHEET.insertSheet("Progress");
    progressSheet.appendRow(["Email", "LessonID"]);
  }
}

// دالة التعامل مع طلبات GET
function doGet(e) {
  setupDatabase();
  const action = e.parameter.action;
  
  if (action === "login") {
    const email = e.parameter.email;
    const password = e.parameter.password;
    return loginStudent(email, password);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Action not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// دالة التعامل مع طلبات POST
function doPost(e) {
  setupDatabase();
  let postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid JSON payload" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = postData.action;
  if (action === "toggleLesson") {
    return toggleLessonProgress(postData.email, postData.lessonId, postData.done);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Action not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// دالة تسجيل الدخول والتحقق
function loginStudent(email, password) {
  const sheet = SPREADSHEET.getSheetByName("Students");
  const data = sheet.getDataRange().getValues();
  
  // البحث عن الطالب
  let studentRecord = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email.toString().toLowerCase() && data[i][1].toString() === password.toString()) {
      studentRecord = {
        email: data[i][0],
        name: data[i][2],
        warningsCount: parseInt(data[i][3] || 0),
        latesCount: parseInt(data[i][4] || 0),
        warningsList: data[i][5] ? data[i][5].toString().split("|") : [],
        latesList: data[i][6] ? data[i][6].toString().split("|") : []
      };
      break;
    }
  }
  
  if (!studentRecord) {
    return createJsonResponse({ success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }
  
  // جلب الدروس المكتملة
  const progressSheet = SPREADSHEET.getSheetByName("Progress");
  const progressData = progressSheet.getDataRange().getValues();
  const completedLessons = [];
  
  for (let j = 1; j < progressData.length; j++) {
    if (progressData[j][0].toString().toLowerCase() === email.toString().toLowerCase()) {
      completedLessons.push(progressData[j][1].toString());
    }
  }
  
  studentRecord.completedLessons = completedLessons;
  
  return createJsonResponse({ success: true, student: studentRecord });
}

// دالة تحديث حالة الدرس (مكتمل / غير مكتمل)
function toggleLessonProgress(email, lessonId, done) {
  const sheet = SPREADSHEET.getSheetByName("Progress");
  const data = sheet.getDataRange().getValues();
  
  const normalizedEmail = email.toString().toLowerCase();
  const normalizedLessonId = lessonId.toString();
  
  let foundIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === normalizedEmail && data[i][1].toString() === normalizedLessonId) {
      foundIndex = i + 1; // +1 لأن الأسطر تبدأ من 1 والـ index من 0
      break;
    }
  }
  
  if (done) {
    if (foundIndex === -1) {
      sheet.appendRow([email, lessonId]);
    }
  } else {
    if (foundIndex !== -1) {
      sheet.deleteRow(foundIndex);
    }
  }
  
  return createJsonResponse({ success: true });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
`;
