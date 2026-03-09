import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding database...');

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const userPassword = await bcrypt.hash('user123', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@studytracker.com' },
    update: {},
    create: {
      email: 'admin@studytracker.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@studytracker.com' },
    update: {},
    create: {
      email: 'user@studytracker.com',
      passwordHash: userPassword,
      name: 'Study User',
      role: 'USER',
    },
  });

  console.log(`Created users: ${admin.email}, ${user.email}`);

  // ─── Topics ───────────────────────────────────────────────────────────────
  const topicsData = [
    {
      name: 'Kimia Organik',
      description: 'Senyawa karbon, reaksi substitusi, eliminasi, dan adisi',
      category: 'CHEMISTRY' as const,
      color: '#6366f1',
    },
    {
      name: 'Bahasa Inggris',
      description: 'Grammar, vocabulary, reading comprehension, dan writing',
      category: 'ENGLISH' as const,
      color: '#22c55e',
    },
    {
      name: 'Kalkulus',
      description: 'Turunan, integral, limit, dan deret',
      category: 'MATH' as const,
      color: '#f59e0b',
    },
    {
      name: 'Fisika Dasar',
      description: 'Mekanika, termodinamika, gelombang, dan optik',
      category: 'PHYSICS' as const,
      color: '#3b82f6',
    },
    {
      name: 'Biologi Sel',
      description: 'Struktur sel, metabolisme, mitosis, dan meiosis',
      category: 'BIOLOGY' as const,
      color: '#ec4899',
    },
  ];

  const topics = [];
  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: {
        userId_name: { userId: user.id, name: t.name },
      },
      update: {},
      create: {
        ...t,
        userId: user.id,
      },
    });
    topics.push(topic);
  }

  console.log(`Created ${topics.length} topics`);

  // ─── Quiz Questions (3 per topic) ─────────────────────────────────────────
  const quizData = [
    // Kimia Organik
    {
      topicId: topics[0].id,
      question: 'Apa nama reaksi penambahan gugus halogen pada alkena?',
      options: ['Substitusi', 'Eliminasi', 'Adisi', 'Oksidasi'],
      correctIndex: 2,
      explanation: 'Reaksi adisi adalah penambahan atom/gugus pada ikatan rangkap alkena.',
    },
    {
      topicId: topics[0].id,
      question: 'Rumus umum alkana adalah?',
      options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnHn'],
      correctIndex: 1,
      explanation: 'Alkana adalah hidrokarbon jenuh dengan rumus CnH2n+2.',
    },
    {
      topicId: topics[0].id,
      question: 'Senyawa CH3-CH2-OH termasuk golongan?',
      options: ['Eter', 'Aldehid', 'Alkohol', 'Keton'],
      correctIndex: 2,
      explanation: 'Gugus -OH (hidroksil) pada rantai karbon menandakan golongan alkohol.',
    },
    // Bahasa Inggris
    {
      topicId: topics[1].id,
      question: 'Which sentence uses the Present Perfect tense correctly?',
      options: [
        'I go to Bali last year.',
        'She has visited Paris twice.',
        'They were eat dinner now.',
        'He goes to school yesterday.',
      ],
      correctIndex: 1,
      explanation: 'Present Perfect uses have/has + past participle. "has visited" is correct.',
    },
    {
      topicId: topics[1].id,
      question: 'The word "benevolent" most nearly means?',
      options: ['Hostile', 'Generous', 'Strict', 'Careless'],
      correctIndex: 1,
      explanation: 'Benevolent means well-meaning and kindly; generous in nature.',
    },
    {
      topicId: topics[1].id,
      question: 'Choose the correct passive form: "The teacher explains the lesson."',
      options: [
        'The lesson is explained by the teacher.',
        'The lesson explained by the teacher.',
        'The lesson was explained by the teacher.',
        'The lesson is explain by the teacher.',
      ],
      correctIndex: 0,
      explanation: 'Passive present simple: subject + is/am/are + past participle + by + agent.',
    },
    // Kalkulus
    {
      topicId: topics[2].id,
      question: 'Turunan dari f(x) = x³ adalah?',
      options: ['3x', '3x²', 'x²', '2x³'],
      correctIndex: 1,
      explanation: 'Menggunakan aturan pangkat: d/dx(xⁿ) = n·xⁿ⁻¹, sehingga d/dx(x³) = 3x².',
    },
    {
      topicId: topics[2].id,
      question: '∫2x dx = ?',
      options: ['x + C', 'x² + C', '2x² + C', '2 + C'],
      correctIndex: 1,
      explanation: '∫2x dx = 2·(x²/2) + C = x² + C.',
    },
    {
      topicId: topics[2].id,
      question: 'Nilai lim(x→2) (x² - 4)/(x - 2) adalah?',
      options: ['0', '2', '4', 'Tidak ada'],
      correctIndex: 2,
      explanation: 'Faktorkan: (x²-4)/(x-2) = (x+2)(x-2)/(x-2) = x+2. Saat x→2: 2+2 = 4.',
    },
    // Fisika Dasar
    {
      topicId: topics[3].id,
      question: 'Hukum Newton II menyatakan bahwa F = ?',
      options: ['m/a', 'm·v', 'm·a', 'v/t'],
      correctIndex: 2,
      explanation: 'Hukum Newton II: gaya (F) = massa (m) × percepatan (a).',
    },
    {
      topicId: topics[3].id,
      question: 'Satuan SI untuk energi adalah?',
      options: ['Watt', 'Newton', 'Joule', 'Pascal'],
      correctIndex: 2,
      explanation: 'Joule (J) adalah satuan SI untuk energi dan usaha.',
    },
    {
      topicId: topics[3].id,
      question: 'Kecepatan cahaya dalam vakum adalah sekitar?',
      options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'],
      correctIndex: 1,
      explanation: 'Kecepatan cahaya c ≈ 3×10⁸ m/s (299,792,458 m/s).',
    },
    // Biologi Sel
    {
      topicId: topics[4].id,
      question: 'Organel sel yang berfungsi sebagai pusat kendali sel adalah?',
      options: ['Mitokondria', 'Ribosom', 'Nukleus', 'Lisosom'],
      correctIndex: 2,
      explanation: 'Nukleus (inti sel) mengandung DNA dan mengatur seluruh aktivitas sel.',
    },
    {
      topicId: topics[4].id,
      question: 'Proses pembelahan sel untuk reproduksi seksual disebut?',
      options: ['Mitosis', 'Meiosis', 'Amitosis', 'Sitokinesis'],
      correctIndex: 1,
      explanation: 'Meiosis menghasilkan sel gamet (sperma/ovum) dengan kromosom haploid (n).',
    },
    {
      topicId: topics[4].id,
      question: 'ATP diproduksi di organel?',
      options: ['Kloroplas', 'Vakuola', 'Mitokondria', 'Aparatus Golgi'],
      correctIndex: 2,
      explanation: 'Mitokondria adalah "powerhouse of the cell" yang memproduksi ATP melalui respirasi seluler.',
    },
  ];

  let quizCount = 0;
  for (const q of quizData) {
    await prisma.quizQuestion.upsert({
      where: {
        topicId_question: { topicId: q.topicId, question: q.question },
      },
      update: {},
      create: q,
    });
    quizCount++;
  }

  console.log(`Created ${quizCount} quiz questions`);

  // ─── Sample Study Sessions ─────────────────────────────────────────────────
  const now = new Date();
  const sessionsData = [
    {
      userId: user.id,
      topicId: topics[0].id,
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      durationMin: 90,
      notes: 'Review reaksi organik bab 1-3',
    },
    {
      userId: user.id,
      topicId: topics[1].id,
      startTime: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      durationMin: 60,
      notes: 'Practice reading comprehension TOEFL',
    },
    {
      userId: user.id,
      topicId: topics[2].id,
      startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
      durationMin: 120,
      notes: 'Latihan soal integral dan turunan',
    },
    {
      userId: user.id,
      topicId: topics[3].id,
      startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000),
      durationMin: 75,
      notes: 'Review mekanika dan termodinamika',
    },
    {
      userId: user.id,
      topicId: topics[4].id,
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      durationMin: 45,
      notes: 'Belajar struktur sel dan organel',
    },
    {
      userId: user.id,
      topicId: topics[0].id,
      startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      durationMin: 90,
      notes: 'Latihan soal kimia organik UTS',
    },
  ];

  let sessionCount = 0;
  for (const s of sessionsData) {
    await prisma.studySession.create({ data: s });
    sessionCount++;
  }

  console.log(`Created ${sessionCount} study sessions`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
