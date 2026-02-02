import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.kidActivityLog.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.healthLog.deleteMany();
  await prisma.kidSchedule.deleteMany();
  await prisma.dayOff.deleteMany();
  await prisma.fredSchedule.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.frozenMeal.deleteMany();
  await prisma.kid.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appConfig.deleteMany();

  // Create App Configurations
  const configs = [
    // Task categories
    { type: 'task_category', value: 'cleaning', label: 'Cleaning', sortOrder: 0 },
    { type: 'task_category', value: 'cooking', label: 'Cooking', sortOrder: 1 },
    { type: 'task_category', value: 'laundry', label: 'Laundry', sortOrder: 2 },
    { type: 'task_category', value: 'kids', label: 'Kids', sortOrder: 3 },
    { type: 'task_category', value: 'shopping', label: 'Shopping', sortOrder: 4 },
    { type: 'task_category', value: 'other', label: 'Other', sortOrder: 5 },
    // Inventory categories
    { type: 'inventory_category', value: 'pantry', label: 'Pantry', sortOrder: 0 },
    { type: 'inventory_category', value: 'fridge', label: 'Fridge', sortOrder: 1 },
    { type: 'inventory_category', value: 'freezer', label: 'Freezer', sortOrder: 2 },
    { type: 'inventory_category', value: 'shisha', label: 'Shisha', sortOrder: 3 },
    // Units
    { type: 'unit', value: 'kg', label: 'kg', sortOrder: 0 },
    { type: 'unit', value: 'g', label: 'grams', sortOrder: 1 },
    { type: 'unit', value: 'l', label: 'liters', sortOrder: 2 },
    { type: 'unit', value: 'ml', label: 'ml', sortOrder: 3 },
    { type: 'unit', value: 'packs', label: 'packs', sortOrder: 4 },
    { type: 'unit', value: 'bottles', label: 'bottles', sortOrder: 5 },
    { type: 'unit', value: 'cans', label: 'cans', sortOrder: 6 },
    { type: 'unit', value: 'boxes', label: 'boxes', sortOrder: 7 },
    { type: 'unit', value: 'pieces', label: 'pieces', sortOrder: 8 },
    { type: 'unit', value: 'bags', label: 'bags', sortOrder: 9 },
    { type: 'unit', value: 'loaves', label: 'loaves', sortOrder: 10 },
    // Activity types
    { type: 'activity_type', value: 'play', label: 'Play', sortOrder: 0 },
    { type: 'activity_type', value: 'learning', label: 'Learning', sortOrder: 1 },
    { type: 'activity_type', value: 'outdoor', label: 'Outdoor', sortOrder: 2 },
    { type: 'activity_type', value: 'screen', label: 'Screen Time', sortOrder: 3 },
    { type: 'activity_type', value: 'nap', label: 'Nap', sortOrder: 4 },
    { type: 'activity_type', value: 'other', label: 'Other', sortOrder: 5 },
    // Meal types
    { type: 'meal_type', value: 'breakfast', label: 'Breakfast', sortOrder: 0 },
    { type: 'meal_type', value: 'lunch', label: 'Lunch', sortOrder: 1 },
    { type: 'meal_type', value: 'dinner', label: 'Dinner', sortOrder: 2 },
    { type: 'meal_type', value: 'snack', label: 'Snack', sortOrder: 3 },
    // Shopping list types
    { type: 'shopping_list_type', value: 'grocery', label: 'Grocery', sortOrder: 0 },
    { type: 'shopping_list_type', value: 'pharmacy', label: 'Pharmacy', sortOrder: 1 },
    // Health log types
    { type: 'health_log_type', value: 'poop', label: 'Poop', sortOrder: 0 },
    { type: 'health_log_type', value: 'pee', label: 'Pee', sortOrder: 1 },
    // Food sources
    { type: 'food_source', value: 'fresh', label: 'Fresh', sortOrder: 0 },
    { type: 'food_source', value: 'frozen', label: 'Frozen', sortOrder: 1 },
    // Portion options
    { type: 'portion_option', value: 'all', label: 'All (100%)', sortOrder: 0 },
    { type: 'portion_option', value: 'most', label: 'Most (75%)', sortOrder: 1 },
    { type: 'portion_option', value: 'half', label: 'Half (50%)', sortOrder: 2 },
    { type: 'portion_option', value: 'little', label: 'Little (25%)', sortOrder: 3 },
    { type: 'portion_option', value: 'none', label: 'None (0%)', sortOrder: 4 },
    // Day off types
    { type: 'day_off_type', value: 'full', label: 'Full Day', sortOrder: 0 },
    { type: 'day_off_type', value: 'half_am', label: 'Half Day (AM)', sortOrder: 1 },
    { type: 'day_off_type', value: 'half_pm', label: 'Half Day (PM)', sortOrder: 2 },
  ];

  for (const config of configs) {
    await prisma.appConfig.create({ data: config });
  }
  console.log('App configurations created');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedPin = await bcrypt.hash('1234', 10);

  const fred = await prisma.user.create({
    data: {
      name: 'Fred',
      email: 'fred@haddad.com',
      password: hashedPassword,
      role: 'ADMIN',
      language: 'en',
    },
  });

  const elsy = await prisma.user.create({
    data: {
      name: 'Elsy',
      email: 'elsy@elsy.com',
      password: hashedPassword,
      role: 'ADMIN',
      language: 'en',
    },
  });

  const saleem = await prisma.user.create({
    data: {
      name: 'Saleem',
      email: 'saleem@haddad.com',
      password: hashedPassword,
      role: 'DRIVER',
      language: 'ur',
      pin: hashedPin,
      pinSetAt: new Date(),
    },
  });

  const karen = await prisma.user.create({
    data: {
      name: 'Karen',
      email: 'karen@haddad.com',
      password: hashedPassword,
      role: 'NANNY',
      language: 'en',
      altLanguage: 'tl',
      pin: hashedPin,
      pinSetAt: new Date(),
    },
  });

  const wincate = await prisma.user.create({
    data: {
      name: 'Wincate',
      email: 'wincate@haddad.com',
      password: hashedPassword,
      role: 'NANNY',
      language: 'en',
      altLanguage: 'sw',
      pin: hashedPin,
      pinSetAt: new Date(),
    },
  });

  const ada = await prisma.user.create({
    data: {
      name: 'Ada',
      email: 'ada@haddad.com',
      password: hashedPassword,
      role: 'MAID',
      language: 'am',
      pin: hashedPin,
      pinSetAt: new Date(),
    },
  });

  const bella = await prisma.user.create({
    data: {
      name: 'Bella',
      email: 'bella@haddad.com',
      password: hashedPassword,
      role: 'MAID',
      language: 'am',
      pin: hashedPin,
      pinSetAt: new Date(),
    },
  });

  console.log('Users created');

  // Create Kids
  const anthony = await prisma.kid.create({
    data: {
      name: 'Anthony',
      birthDate: new Date('2021-02-01'),
    },
  });

  const rodney = await prisma.kid.create({
    data: {
      name: 'Rodney',
      birthDate: new Date('2023-02-01'),
    },
  });

  console.log('Kids created');

  // Create Tasks
  const tasks = [
    { title: 'Clean kitchen', category: 'cleaning', assigneeIds: [ada.id, bella.id] },
    { title: 'Prepare lunch', category: 'cooking', assigneeIds: [karen.id] },
    { title: 'Laundry - bedsheets', category: 'laundry', assigneeIds: [bella.id] },
    { title: 'Take Anthony to school', category: 'kids', assigneeIds: [saleem.id] },
    { title: 'Grocery shopping', category: 'shopping', assigneeIds: [saleem.id] },
    { title: 'Vacuum living room', category: 'cleaning', assigneeIds: [ada.id] },
    { title: 'Prepare dinner', category: 'cooking', assigneeIds: [wincate.id] },
    { title: 'Pick up kids from school', category: 'kids', assigneeIds: [saleem.id] },
    { title: 'Iron clothes', category: 'laundry', assigneeIds: [ada.id] },
    { title: 'Organize pantry', category: 'other', assigneeIds: [bella.id] },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        title: task.title,
        category: task.category,
        createdById: elsy.id,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        assignments: {
          create: task.assigneeIds.map(userId => ({ userId })),
        },
      },
    });
  }

  console.log('Tasks created');

  // Create Inventory Items
  const pantryItems = [
    { name: 'Rice', subCategory: 'grains', quantity: 5, unit: 'kg', lowThreshold: 2 },
    { name: 'Pasta', subCategory: 'grains', quantity: 8, unit: 'packs', lowThreshold: 3 },
    { name: 'Olive Oil', subCategory: 'other', quantity: 2, unit: 'bottles', lowThreshold: 1 },
    { name: 'Cereal', subCategory: 'grains', quantity: 3, unit: 'boxes', lowThreshold: 1 },
    { name: 'Canned Tomatoes', subCategory: 'vegetables', quantity: 10, unit: 'cans', lowThreshold: 4 },
    { name: 'Milk', subCategory: 'dairy', quantity: 4, unit: 'liters', lowThreshold: 2 },
    { name: 'Eggs', subCategory: 'dairy', quantity: 24, unit: 'pieces', lowThreshold: 12 },
    { name: 'Bread', subCategory: 'grains', quantity: 2, unit: 'loaves', lowThreshold: 1 },
    { name: 'Cheese', subCategory: 'dairy', quantity: 500, unit: 'grams', lowThreshold: 200 },
    { name: 'Butter', subCategory: 'dairy', quantity: 2, unit: 'packs', lowThreshold: 1 },
  ];

  const fridgeItems = [
    { name: 'Chicken', subCategory: 'meat', quantity: 2, unit: 'kg', lowThreshold: 1 },
    { name: 'Beef', subCategory: 'meat', quantity: 1, unit: 'kg', lowThreshold: 0 },
    { name: 'Vegetables Mix', subCategory: 'vegetables', quantity: 3, unit: 'bags', lowThreshold: 1 },
    { name: 'Yogurt', subCategory: 'dairy', quantity: 6, unit: 'cups', lowThreshold: 2 },
    { name: 'Juice', subCategory: 'beverages', quantity: 4, unit: 'bottles', lowThreshold: 2 },
  ];

  const freezerItems = [
    { name: 'Ice Cream', subCategory: 'snacks', quantity: 2, unit: 'tubs', lowThreshold: 1 },
    { name: 'Frozen Peas', subCategory: 'vegetables', quantity: 3, unit: 'bags', lowThreshold: 1 },
    { name: 'Fish Fillets', subCategory: 'meat', quantity: 1, unit: 'kg', lowThreshold: 0 },
  ];

  const shishaItems = [
    { name: 'Al Fakher Mint', subCategory: 'tobacco', quantity: 3, brand: 'Al Fakher', flavor: 'Mint' },
    { name: 'Al Fakher Grape', subCategory: 'tobacco', quantity: 2, brand: 'Al Fakher', flavor: 'Grape' },
    { name: 'Main Hookah', subCategory: 'pipes', quantity: 1 },
    { name: 'Charcoal', subCategory: 'charcoal', quantity: 5, unit: 'boxes', lowThreshold: 2 },
  ];

  for (const item of pantryItems) {
    await prisma.inventoryItem.create({ data: { ...item, category: 'pantry' } });
  }
  for (const item of fridgeItems) {
    await prisma.inventoryItem.create({ data: { ...item, category: 'fridge' } });
  }
  for (const item of freezerItems) {
    await prisma.inventoryItem.create({ data: { ...item, category: 'freezer' } });
  }
  for (const item of shishaItems) {
    await prisma.inventoryItem.create({ data: { ...item, category: 'shisha' } });
  }

  console.log('Inventory items created');

  // Create Frozen Meals
  const frozenMeals = [
    { name: 'Chicken Nuggets', quantity: 3, description: 'Kids favorite' },
    { name: 'Mac and Cheese', quantity: 5, description: 'Homemade, frozen in portions' },
    { name: 'Spaghetti Bolognese', quantity: 4, description: 'Adult portions' },
    { name: 'Vegetable Soup', quantity: 6, description: 'Healthy option' },
    { name: 'Fish Fingers', quantity: 2, description: 'Quick lunch option' },
  ];

  for (const meal of frozenMeals) {
    await prisma.frozenMeal.create({ data: meal });
  }

  console.log('Frozen meals created');

  // Create Kid Schedules
  await prisma.kidSchedule.createMany({
    data: [
      { kidId: anthony.id, activity: 'School', dayOfWeek: 1, time: '08:00', location: 'Emirates British Nursery' },
      { kidId: anthony.id, activity: 'School', dayOfWeek: 2, time: '08:00', location: 'Emirates British Nursery' },
      { kidId: anthony.id, activity: 'School', dayOfWeek: 3, time: '08:00', location: 'Emirates British Nursery' },
      { kidId: anthony.id, activity: 'School', dayOfWeek: 4, time: '08:00', location: 'Emirates British Nursery' },
      { kidId: anthony.id, activity: 'School', dayOfWeek: 5, time: '08:00', location: 'Emirates British Nursery' },
      { kidId: anthony.id, activity: 'Soccer', dayOfWeek: 6, time: '10:00', location: 'Sports Club' },
      { kidId: rodney.id, activity: 'Playgroup', dayOfWeek: 1, time: '09:30', location: 'Community Center' },
      { kidId: rodney.id, activity: 'Playgroup', dayOfWeek: 3, time: '09:30', location: 'Community Center' },
    ],
  });

  console.log('Kid schedules created');

  // Create sample health logs
  await prisma.healthLog.createMany({
    data: [
      { kidId: anthony.id, type: 'poop', notes: 'Normal', loggedBy: karen.id },
      { kidId: anthony.id, type: 'pee', loggedBy: karen.id },
      { kidId: rodney.id, type: 'poop', notes: 'A bit soft', loggedBy: wincate.id },
    ],
  });

  console.log('Health logs created');

  // Create Fred Schedule (next 7 days)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    const location = dayOfWeek === 0 || dayOfWeek === 6 ? 'wfh' : (Math.random() > 0.3 ? 'office' : 'wfh');
    await prisma.fredSchedule.create({ data: { date, location } });
  }

  console.log('Fred schedule created');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
