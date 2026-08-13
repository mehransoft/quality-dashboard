// این فایل تنظیمات پروژه Firebase شماست.
// این مقادیر "کلید مخفی" نیستند و قرار دادنشان در کد عمومی (public) کاملاً عادی و امن است.
//
// نحوه گرفتن این مقادیر:
//   1. به https://console.firebase.google.com برو و پروژه بساز
//   2. Project settings (چرخ‌دنده کنار Project Overview) -> پایین صفحه "Your apps" -> "Add app" -> وب (</>)
//   3. مقادیر firebaseConfig که نشون می‌ده رو دقیقاً همینجا جایگزین کن

const firebaseConfig = {
  apiKey: "AIzaSyC6KB_9V9ABjCY02h6ohHvBsck7TSynhJo",
  authDomain: "quality-dashboard-meta.firebaseapp.com",
  projectId: "quality-dashboard-meta",
  storageBucket: "quality-dashboard-meta.firebasestorage.app",
  messagingSenderId: "609096000037",
  appId: "1:609096000037:web:522159cdd138019f20d5cc"
};

// ✅ Initialize Firebase با استفاده از سینتکس کامپت (هماهنگ با فایل‌های HTML شما)
const app = firebase.initializeApp(firebaseConfig);

// ایمیل ادمین: فقط این ایمیل اجازه تأیید/رد کاربران رو داره (در پنل admin.html)
// این مقدار رو دقیقاً همینجا و همچنین داخل firestore.rules و storage.rules
// (هر دو) با ایمیل واقعی خودت جایگزین کن — باید در هر سه جا یکی باشه.
const ADMIN_EMAIL = "mehranpourdada@gmail.com";
