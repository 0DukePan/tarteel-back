import { pgTable, uuid, varchar, text, integer, timestamp, boolean, time, date, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Parents table
export const parents = pgTable("parents", {
  id: uuid('id').primaryKey().defaultRandom(),
  fatherFirstName: varchar('father_first_name', { length: 100 }).notNull(),
  fatherLastName: varchar('father_last_name', { length: 100 }).notNull(),
  fatherPhone: varchar("father_phone", { length: 20 }).notNull(),
  fatherEmail: varchar("father_email", { length: 255 }).notNull().unique(),
  motherFirstName: varchar('mother_first_name', { length: 100 }),
  motherLastName: varchar('mother_last_name', { length: 100 }),
  motherPhone: varchar("mother_phone", { length: 20 }),
  motherEmail: varchar("mother_email", { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 20 }).default('parent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Teachers table 
export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  specialization: text('specialization'),
  biography: text('biography'),
  profilePicture: varchar('profile_picture', { length: 255 }),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 20 }).default('teacher'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Classes table
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  classType: varchar('class_type', { length: 50 }).notNull().default('group'), // e.g., 'one-on-one', 'group', 'self-paced'
  recurrence: text('recurrence'), // e.g., 'MWF 5PM', 'TTH 10AM'
  virtualMeetingLink: varchar('virtual_meeting_link', { length: 500 }),
  ageMin: integer('age_min').notNull(),
  ageMax: integer('age_max').notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id),
  maxStudents: integer('max_students').notNull().default(20),
  currentStudents: integer('current_students').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Students table 
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id').references(() => parents.id, { onDelete: 'cascade' }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  age: integer('age').notNull(),
  classId: uuid('class_id').references(() => classes.id),
  registrationStatus: varchar('registration_status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Admins table 
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  teacherId: uuid('teacher_id').references(() => teachers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  enrollmentDate: timestamp('enrollment_date').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // e.g., active, completed, dropped
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Assignments table
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  maxPoints: integer('max_points').notNull().default(100),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Grades table (defined before submissions to avoid circular reference)
export const grades = pgTable('grades', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id'), // Will reference submissions after it's defined
  assignmentId: uuid('assignment_id').references(() => assignments.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  score: integer('score').notNull(),
  feedback: text('feedback'),
  gradedAt: timestamp('graded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Submissions table
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id').references(() => assignments.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  submissionUrl: text('submission_url'), // For file uploads, audio recordings, etc.
  submissionText: text('submission_text'), // For text-based answers
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  gradeId: uuid('grade_id').references(() => grades.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Attendance table
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('present'), // e.g., present, absent, excused
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').notNull(), // Can be admin, teacher, or parent
  receiverId: uuid('receiver_id').notNull(), // Can be admin, teacher, or parent
  senderRole: varchar('sender_role', { length: 20 }).notNull(),
  receiverRole: varchar('receiver_role', { length: 20 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Learning Materials table
export const learningMaterials = pgTable('learning_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // e.g., pdf, doc, mp3, mp4
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Curriculums table
export const curriculums = pgTable('curriculums', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Curriculum Lessons table
export const curriculumLessons = pgTable('curriculum_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  curriculumId: uuid('curriculum_id').references(() => curriculums.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Student Progress table (for curriculum lessons)
export const studentProgress = pgTable('student_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => curriculumLessons.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('in-progress'), // e.g., 'in-progress', 'completed', 'skipped'
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Forums table
export const forums = pgTable('forums', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Topics table
export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  forumId: uuid('forum_id').references(() => forums.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').notNull(), // Can be admin, teacher, parent, or student
  authorRole: varchar('author_role', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Posts table (for replies to topics)
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').notNull(), // Can be admin, teacher, parent, or student
  authorRole: varchar('author_role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Comments table (for replies to posts)
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').notNull(), // Can be admin, teacher, parent, or student
  authorRole: varchar('author_role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(),
  paymentDate: timestamp('payment_date').defaultNow().notNull(),
  method: varchar('method', { length: 50 }).notNull(), // e.g., 'credit card', 'paypal', 'bank transfer'
  status: varchar('status', { length: 20 }).notNull().default('pending'), // e.g., 'pending', 'completed', 'failed'
  transactionId: varchar('transaction_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references(() => parents.id, { onDelete: 'cascade' }).notNull(),
  amountDue: integer('amount_due').notNull(),
  dueDate: date('due_date').notNull(),
  issueDate: timestamp('issue_date').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('unpaid'), // e.g., 'unpaid', 'paid', 'partially_paid', 'overdue'
  fileUrl: varchar('file_url', { length: 500 }), // URL to a PDF invoice
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Badges table
export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 500 }),
  criteria: text('criteria'), // Description of how to earn the badge
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Badges (junction table for students to badges)
export const userBadges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  badgeId: uuid('badge_id').references(() => badges.id, { onDelete: 'cascade' }).notNull(),
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Recitations table (for AI-powered Tajweed feedback)
export const recitations = pgTable('recitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  suraNumber: integer('sura_number').notNull(),
  ayaNumber: integer('aya_number').notNull(),
  audioUrl: varchar('audio_url', { length: 500 }).notNull(),
  transcribedText: text('transcribed_text'),
  tajweedFeedback: jsonb('tajweed_feedback'), // Detailed feedback from AI model in JSON format
  score: integer('score'), // Overall score from AI model
  recitationDate: timestamp('recitation_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Hifz Progress table
export const hifzProgress = pgTable('hifz_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  suraNumber: integer('sura_number').notNull(),
  ayaNumber: integer('aya_number').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('not_started'), // e.g., 'not_started', 'in_progress', 'memorized'
  memorizedDate: timestamp('memorized_date'),
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review'), // Calculated based on revision schedule
  masteryLevel: integer('mastery_level').notNull().default(0), // e.g., 0-5
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Hifz Goals table
export const hifzGoals = pgTable('hifz_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  targetSuraNumber: integer('target_sura_number'), // Optional, if goal is for a specific Sura
  targetAyaStart: integer('target_aya_start'),    // Optional
  targetAyaEnd: integer('target_aya_end'),        // Optional
  targetDate: date('target_date'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // e.g., 'active', 'completed', 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Revision Schedules table
export const revisionSchedules = pgTable('revision_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  suraNumber: integer('sura_number'), // Optional, if schedule is for a specific Sura
  ayaNumber: integer('aya_number'),  // Optional, if schedule is for a specific Aya
  nextReviewDate: date('next_review_date').notNull(),
  intervalDays: integer('interval_days').notNull(), // e.g., 7, 30, 90 days
  lastReviewedDate: date('last_reviewed_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('info'), // e.g., 'reminder', 'alert', 'info'
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// Quran Translations table
export const quranTranslations = pgTable('quran_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  suraNumber: integer('sura_number').notNull(),
  ayaNumber: integer('aya_number').notNull(),
  languageCode: varchar('language_code', { length: 10 }).notNull(), // e.g., 'en', 'es', 'fr'
  translatorName: varchar('translator_name', { length: 100 }).notNull(),
  translationText: text('translation_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quran Tafsirs table
export const quranTafsirs = pgTable('quran_tafsirs', {
  id: uuid('id').primaryKey().defaultRandom(),
  suraNumber: integer('sura_number').notNull(),
  ayaNumber: integer('aya_number').notNull(),
  tafsirName: varchar('tafsir_name', { length: 100 }).notNull(), // e.g., 'Jalalayn', 'Ibn Kathir'
  tafsirText: text('tafsir_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quran Word Analysis table
export const quranWordAnalysis = pgTable('quran_word_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  suraNumber: integer('sura_number').notNull(),
  ayaNumber: integer('aya_number').notNull(),
  wordNumber: integer('word_number').notNull(),
  arabicWord: varchar('arabic_word', { length: 255 }).notNull(),
  rootWord: varchar('root_word', { length: 255 }),
  grammarInfo: jsonb('grammar_info'), // Flexible JSON for detailed grammar data
  meaning: text('meaning'), // Basic meaning of the word
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Virtual Classrooms table
export const virtualClassrooms = pgTable('virtual_classrooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledTime: timestamp('scheduled_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'set null' }), // Optional, if linked to a specific class
  meetingLink: varchar('meeting_link', { length: 500 }), // e.g., for Jitsi, Daily.co
  status: varchar('status', { length: 50 }).notNull().default('scheduled'), // e.g., 'scheduled', 'live', 'ended', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Session Participants table
export const sessionParticipants = pgTable('session_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  classroomId: uuid('classroom_id').references(() => virtualClassrooms.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(), // Can be student or teacher
  userRole: varchar('user_role', { length: 20 }).notNull(), // 'student' or 'teacher'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chat Messages table for virtual classrooms
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  classroomId: uuid('classroom_id').references(() => virtualClassrooms.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').notNull(), // Can be student or teacher
  senderRole: varchar('sender_role', { length: 20 }).notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// Relations
export const parentsRelations = relations(parents, ({ many }) => ({
  students: many(students),
}))

export const teachersRelations = relations(teachers, ({ many }) => ({
  classes: many(classes),
  virtualClassrooms: many(virtualClassrooms), // New relation
}))

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [classes.teacherId],
    references: [teachers.id],
  }),
  students: many(students),
  virtualClassrooms: many(virtualClassrooms), // New relation
}))

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [courses.teacherId],
    references: [teachers.id],
  }),
  enrollments: many(enrollments),
}))

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}))

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  teacher: one(teachers, {
    fields: [assignments.teacherId],
    references: [teachers.id],
  }),
  submissions: many(submissions),
}))

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(students, {
    fields: [submissions.studentId],
    references: [students.id],
  }),
  grade: one(grades, {
    fields: [submissions.gradeId],
    references: [grades.id],
  }),
}))

export const gradesRelations = relations(grades, ({ one }) => ({
  submission: one(submissions, {
    fields: [grades.submissionId],
    references: [submissions.id],
  }),
  assignment: one(assignments, {
    fields: [grades.assignmentId],
    references: [assignments.id],
  }),
  student: one(students, {
    fields: [grades.studentId],
    references: [students.id],
  }),
  teacher: one(teachers, {
    fields: [grades.teacherId],
    references: [teachers.id],
  }),
}))

export const attendanceRelations = relations(attendance, ({ one }) => ({
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  // Assuming senderId and receiverId can refer to any user type
  // Drizzle doesn't directly support polymorphic relations without extra tables or views.
  // This would typically be handled at the application logic level or with join tables.
}))

export const learningMaterialsRelations = relations(learningMaterials, ({ one }) => ({
  class: one(classes, {
    fields: [learningMaterials.classId],
    references: [classes.id],
  }),
  teacher: one(teachers, {
    fields: [learningMaterials.teacherId],
    references: [teachers.id],
  }),
}))

export const curriculumsRelations = relations(curriculums, ({ one, many }) => ({
  course: one(courses, {
    fields: [curriculums.courseId],
    references: [courses.id],
  }),
  lessons: many(curriculumLessons),
}))

export const curriculumLessonsRelations = relations(curriculumLessons, ({ one, many }) => ({
  curriculum: one(curriculums, {
    fields: [curriculumLessons.curriculumId],
    references: [curriculums.id],
  }),
  studentProgress: many(studentProgress),
}))

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  student: one(students, {
    fields: [studentProgress.studentId],
    references: [students.id],
  }),
  lesson: one(curriculumLessons, {
    fields: [studentProgress.lessonId],
    references: [curriculumLessons.id],
  }),
}))



export const forumsRelations = relations(forums, ({ many }) => ({
  topics: many(topics),
}))

export const topicsRelations = relations(topics, ({ one, many }) => ({
  forum: one(forums, {
    fields: [topics.forumId],
    references: [forums.id],
  }),
  // Polymorphic relation for author (admin, teacher, parent, student) would be handled in application logic or with join tables.
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  topic: one(topics, {
    fields: [posts.topicId],
    references: [topics.id],
  }),
  // Polymorphic relation for author
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  // Polymorphic relation for author
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [payments.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [invoices.enrollmentId],
    references: [enrollments.id],
  }),
  parent: one(parents, {
    fields: [invoices.parentId],
    references: [parents.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  student: one(students, {
    fields: [userBadges.studentId],
    references: [students.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Relations for Translations, Tafsirs, and Word Analysis (No direct student relation)
export const quranTranslationsRelations = relations(quranTranslations, ({ }) => ({}));
export const quranTafsirsRelations = relations(quranTafsirs, ({ }) => ({}));
export const quranWordAnalysisRelations = relations(quranWordAnalysis, ({ }) => ({}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  recitations: many(recitations),
  hifzProgress: many(hifzProgress),  // New relation
  hifzGoals: many(hifzGoals),        // New relation
  revisionSchedules: many(revisionSchedules), // New relation
  notifications: many(notifications), // New relation
  sessionParticipants: many(sessionParticipants), // New relation
}))

export const virtualClassroomsRelations = relations(virtualClassrooms, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [virtualClassrooms.teacherId],
    references: [teachers.id],
  }),
  class: one(classes, {
    fields: [virtualClassrooms.classId],
    references: [classes.id],
  }),
  sessionParticipants: many(sessionParticipants),
  chatMessages: many(chatMessages),
}));

export const sessionParticipantsRelations = relations(sessionParticipants, ({ one }) => ({
  virtualClassroom: one(virtualClassrooms, {
    fields: [sessionParticipants.classroomId],
    references: [virtualClassrooms.id],
  }),
  // Polymorphic relation for userId (student or teacher) would be handled in application logic
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  virtualClassroom: one(virtualClassrooms, {
    fields: [chatMessages.classroomId],
    references: [virtualClassrooms.id],
  }),
  // Polymorphic relation for senderId
}));
