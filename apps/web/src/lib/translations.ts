// UI translations for supported languages
// en: English, ur: Urdu, tl: Tagalog, sw: Swahili, am: Amharic

export type Language = 'en' | 'ur' | 'tl' | 'sw' | 'am';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.tasks': 'Tasks',
    'nav.inventory': 'Inventory',
    'nav.kids': 'Kids',
    'nav.profile': 'Profile',
    'nav.shopping': 'Shopping',
    'nav.schedule': 'Schedule',
    'nav.staff': 'Staff',
    'nav.dayOff': 'Day Off',
    'nav.mealPlans': 'Meal Plans',
    'nav.admin': 'Admin',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.today': 'Today',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.lowStock': 'Low Stock Alert',
    'dashboard.pendingTasks': 'Pending Tasks',

    // Tasks
    'tasks.title': 'Tasks',
    'tasks.all': 'All',
    'tasks.pending': 'Pending',
    'tasks.completed': 'Completed',
    'tasks.done': 'Done',
    'tasks.add': 'Add',
    'tasks.newTask': 'New Task',
    'tasks.markComplete': 'Mark Complete',
    'tasks.delete': 'Delete Task',
    'tasks.photoProof': 'Photo Proof',
    'tasks.assignedTo': 'Assigned to',
    'tasks.dueDate': 'Due',
    'tasks.category': 'Category',
    'tasks.noTasks': 'No tasks found',

    // Inventory
    'inventory.title': 'Inventory',
    'inventory.pantry': 'Pantry',
    'inventory.fridge': 'Fridge',
    'inventory.freezer': 'Freezer',
    'inventory.shisha': 'Shisha',
    'inventory.lowStock': 'Low Stock',
    'inventory.noItems': 'No items',

    // Kids
    'kids.title': 'Kids',
    'kids.health': 'Health',
    'kids.meals': 'Meals',
    'kids.activities': 'Activities',
    'kids.addHealthLog': 'Add Health Log',
    'kids.addMealLog': 'Add Meal Log',
    'kids.addActivity': 'Add Activity',
    'kids.poop': 'Poop',
    'kids.pee': 'Pee',
    'kids.yearsOld': 'years old',

    // Meals
    'meals.breakfast': 'Breakfast',
    'meals.lunch': 'Lunch',
    'meals.dinner': 'Dinner',
    'meals.snack': 'Snack',
    'meals.fresh': 'Fresh',
    'meals.frozen': 'Frozen',
    'meals.portions': 'Portions eaten',
    'meals.rating': 'How well did they eat?',

    // Shopping
    'shopping.title': 'Shopping Lists',
    'shopping.grocery': 'Grocery',
    'shopping.pharmacy': 'Pharmacy',
    'shopping.newList': 'New List',
    'shopping.addItem': 'Add Item',
    'shopping.complete': 'Complete List',

    // Schedule
    'schedule.title': "Fred's Schedule",
    'schedule.office': 'Office',
    'schedule.wfh': 'WFH',
    'schedule.today': 'Today',

    // Day Off
    'dayOff.title': 'Day Off',
    'dayOff.request': 'Request Day Off',
    'dayOff.fullDay': 'Full Day',
    'dayOff.halfAm': 'Half Day (AM)',
    'dayOff.halfPm': 'Half Day (PM)',
    'dayOff.pending': 'Pending',
    'dayOff.approved': 'Approved',
    'dayOff.denied': 'Denied',

    // Profile
    'profile.title': 'Profile',
    'profile.language': 'Language',
    'profile.logout': 'Logout',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.notes': 'Notes',
    'common.optional': 'optional',
  },

  ur: {
    // Navigation
    'nav.home': 'گھر',
    'nav.tasks': 'کام',
    'nav.inventory': 'انوینٹری',
    'nav.kids': 'بچے',
    'nav.profile': 'پروفائل',
    'nav.shopping': 'خریداری',
    'nav.schedule': 'شیڈول',
    'nav.staff': 'عملہ',
    'nav.dayOff': 'چھٹی',
    'nav.mealPlans': 'کھانے کی منصوبہ بندی',
    'nav.admin': 'ایڈمن',

    // Dashboard
    'dashboard.welcome': 'خوش آمدید',
    'dashboard.today': 'آج',
    'dashboard.quickActions': 'فوری عمل',
    'dashboard.lowStock': 'کم اسٹاک الرٹ',
    'dashboard.pendingTasks': 'زیر التوا کام',

    // Tasks
    'tasks.title': 'کام',
    'tasks.all': 'سب',
    'tasks.pending': 'زیر التوا',
    'tasks.completed': 'مکمل',
    'tasks.done': 'ہو گیا',
    'tasks.add': 'شامل کریں',
    'tasks.newTask': 'نیا کام',
    'tasks.markComplete': 'مکمل کریں',
    'tasks.delete': 'کام حذف کریں',
    'tasks.photoProof': 'تصویری ثبوت',
    'tasks.assignedTo': 'تفویض',
    'tasks.dueDate': 'آخری تاریخ',
    'tasks.category': 'زمرہ',
    'tasks.noTasks': 'کوئی کام نہیں',

    // Inventory
    'inventory.title': 'انوینٹری',
    'inventory.pantry': 'پینٹری',
    'inventory.fridge': 'فریج',
    'inventory.freezer': 'فریزر',
    'inventory.shisha': 'شیشہ',
    'inventory.lowStock': 'کم اسٹاک',
    'inventory.noItems': 'کوئی چیز نہیں',

    // Kids
    'kids.title': 'بچے',
    'kids.health': 'صحت',
    'kids.meals': 'کھانا',
    'kids.activities': 'سرگرمیاں',
    'kids.addHealthLog': 'صحت لاگ',
    'kids.addMealLog': 'کھانے کا لاگ',
    'kids.addActivity': 'سرگرمی شامل کریں',
    'kids.poop': 'پوٹی',
    'kids.pee': 'پیشاب',
    'kids.yearsOld': 'سال',

    // Common
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ',
    'common.back': 'واپس',
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.notes': 'نوٹس',
    'common.optional': 'اختیاری',

    // Profile
    'profile.title': 'پروفائل',
    'profile.language': 'زبان',
    'profile.logout': 'لاگ آؤٹ',
  },

  tl: {
    // Navigation - Tagalog
    'nav.home': 'Bahay',
    'nav.tasks': 'Mga Gawain',
    'nav.inventory': 'Imbentaryo',
    'nav.kids': 'Mga Bata',
    'nav.profile': 'Profile',
    'nav.shopping': 'Pamimili',
    'nav.schedule': 'Iskedyul',
    'nav.staff': 'Staff',
    'nav.dayOff': 'Day Off',
    'nav.mealPlans': 'Mga Plano sa Pagkain',
    'nav.admin': 'Admin',

    // Dashboard
    'dashboard.welcome': 'Maligayang pagdating',
    'dashboard.today': 'Ngayon',
    'dashboard.quickActions': 'Mabilis na Aksyon',
    'dashboard.lowStock': 'Mababang Stock',
    'dashboard.pendingTasks': 'Nakabinbing Gawain',

    // Tasks
    'tasks.title': 'Mga Gawain',
    'tasks.all': 'Lahat',
    'tasks.pending': 'Nakabinbin',
    'tasks.completed': 'Tapos na',
    'tasks.done': 'Tapos',
    'tasks.add': 'Dagdag',
    'tasks.newTask': 'Bagong Gawain',
    'tasks.markComplete': 'Markahan Tapos',
    'tasks.delete': 'Burahin',
    'tasks.photoProof': 'Larawan',
    'tasks.assignedTo': 'Itinalaga sa',
    'tasks.dueDate': 'Deadline',
    'tasks.category': 'Kategorya',
    'tasks.noTasks': 'Walang gawain',

    // Kids
    'kids.title': 'Mga Bata',
    'kids.health': 'Kalusugan',
    'kids.meals': 'Pagkain',
    'kids.activities': 'Aktibidad',
    'kids.addHealthLog': 'Magdagdag ng Health Log',
    'kids.addMealLog': 'Magdagdag ng Meal Log',
    'kids.addActivity': 'Magdagdag ng Aktibidad',
    'kids.poop': 'Dumi',
    'kids.pee': 'Ihi',
    'kids.yearsOld': 'taong gulang',

    // Common
    'common.save': 'I-save',
    'common.cancel': 'Kanselahin',
    'common.back': 'Bumalik',
    'common.loading': 'Naglo-load...',
    'common.notes': 'Mga Tala',
    'common.optional': 'opsyonal',

    // Profile
    'profile.title': 'Profile',
    'profile.language': 'Wika',
    'profile.logout': 'Mag-logout',
  },

  sw: {
    // Navigation - Swahili
    'nav.home': 'Nyumbani',
    'nav.tasks': 'Kazi',
    'nav.inventory': 'Hesabu',
    'nav.kids': 'Watoto',
    'nav.profile': 'Wasifu',
    'nav.shopping': 'Ununuzi',
    'nav.schedule': 'Ratiba',
    'nav.staff': 'Wafanyakazi',
    'nav.dayOff': 'Siku ya Kupumzika',
    'nav.mealPlans': 'Mipango ya Chakula',
    'nav.admin': 'Msimamizi',

    // Dashboard
    'dashboard.welcome': 'Karibu',
    'dashboard.today': 'Leo',
    'dashboard.quickActions': 'Vitendo vya Haraka',
    'dashboard.lowStock': 'Stock ya Chini',
    'dashboard.pendingTasks': 'Kazi Zinazongoja',

    // Tasks
    'tasks.title': 'Kazi',
    'tasks.all': 'Zote',
    'tasks.pending': 'Zinasubiri',
    'tasks.completed': 'Zimekamilika',
    'tasks.done': 'Imekwisha',
    'tasks.add': 'Ongeza',
    'tasks.newTask': 'Kazi Mpya',
    'tasks.markComplete': 'Maliza',
    'tasks.delete': 'Futa',
    'tasks.photoProof': 'Picha',
    'tasks.assignedTo': 'Imepewa',
    'tasks.dueDate': 'Tarehe',
    'tasks.category': 'Aina',
    'tasks.noTasks': 'Hakuna kazi',

    // Kids
    'kids.title': 'Watoto',
    'kids.health': 'Afya',
    'kids.meals': 'Milo',
    'kids.activities': 'Shughuli',
    'kids.addHealthLog': 'Ongeza Afya',
    'kids.addMealLog': 'Ongeza Mlo',
    'kids.addActivity': 'Ongeza Shughuli',
    'kids.poop': 'Kunya',
    'kids.pee': 'Kojoa',
    'kids.yearsOld': 'miaka',

    // Common
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.back': 'Rudi',
    'common.loading': 'Inapakia...',
    'common.notes': 'Maelezo',
    'common.optional': 'si lazima',

    // Profile
    'profile.title': 'Wasifu',
    'profile.language': 'Lugha',
    'profile.logout': 'Ondoka',
  },

  am: {
    // Navigation - Amharic
    'nav.home': 'ቤት',
    'nav.tasks': 'ተግባራት',
    'nav.inventory': 'ክምችት',
    'nav.kids': 'ልጆች',
    'nav.profile': 'መገለጫ',
    'nav.shopping': 'ግዢ',
    'nav.schedule': 'መርሐግብር',
    'nav.staff': 'ሰራተኞች',
    'nav.dayOff': 'እረፍት',
    'nav.mealPlans': 'የምግብ ዕቅዶች',
    'nav.admin': 'አስተዳዳሪ',

    // Dashboard
    'dashboard.welcome': 'እንኳን ደህና መጡ',
    'dashboard.today': 'ዛሬ',
    'dashboard.quickActions': 'ፈጣን እርምጃዎች',
    'dashboard.lowStock': 'ዝቅተኛ ክምችት',
    'dashboard.pendingTasks': 'በመጠባበቅ ላይ ያሉ ተግባራት',

    // Tasks
    'tasks.title': 'ተግባራት',
    'tasks.all': 'ሁሉም',
    'tasks.pending': 'በመጠባበቅ',
    'tasks.completed': 'ተጠናቅቋል',
    'tasks.done': 'ተሰርቷል',
    'tasks.add': 'ጨምር',
    'tasks.newTask': 'አዲስ ተግባር',
    'tasks.markComplete': 'ጨርስ',
    'tasks.delete': 'ሰርዝ',
    'tasks.photoProof': 'ፎቶ',
    'tasks.assignedTo': 'ተመድቧል',
    'tasks.dueDate': 'ቀን',
    'tasks.category': 'ምድብ',
    'tasks.noTasks': 'ተግባር የለም',

    // Kids
    'kids.title': 'ልጆች',
    'kids.health': 'ጤና',
    'kids.meals': 'ምግብ',
    'kids.activities': 'እንቅስቃሴዎች',
    'kids.addHealthLog': 'የጤና መዝገብ',
    'kids.addMealLog': 'የምግብ መዝገብ',
    'kids.addActivity': 'እንቅስቃሴ',
    'kids.poop': 'ሰገራ',
    'kids.pee': 'ሽንት',
    'kids.yearsOld': 'ዓመት',

    // Common
    'common.save': 'አስቀምጥ',
    'common.cancel': 'ሰርዝ',
    'common.back': 'ተመለስ',
    'common.loading': 'በመጫን ላይ...',
    'common.notes': 'ማስታወሻዎች',
    'common.optional': 'አማራጭ',

    // Profile
    'profile.title': 'መገለጫ',
    'profile.language': 'ቋንቋ',
    'profile.logout': 'ውጣ',
  },
};

// Get a translation for a key, falling back to English if not found
export function t(key: string, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
