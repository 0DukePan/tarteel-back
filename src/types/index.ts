export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string>
}

export interface IClass {
  id?: string
  name: string
  startTime: string
  endTime: string
  ageMin: number
  ageMax: number
  teacherId?: string
  maxStudents: number
  currentStudents: number
  createdAt?: Date
  updatedAt?: Date
}

export interface IParent {
  id?: string
  fatherFirstName: string
  fatherLastName: string
  fatherPhone: string
  fatherEmail: string
  motherFirstName?: string
  motherLastName?: string
  motherPhone?: string
  motherEmail?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IStudent {
  id?: string
  parentId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  age: number
  classId?: string
  registrationStatus: "pending" | "approved" | "rejected"
  createdAt?: Date
  updatedAt?: Date
}

export interface ITeacher {
  id?: string
  name: string
  email: string
  phone: string
  specialization?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ICourse {
  id?: string
  name: string
  description?: string | null
  teacherId?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface IEnrollment {
  id?: string
  studentId: string
  courseId?: string
  status: string
  startDate?: string | Date
  endDate?: string | Date | null
  enrollmentDate?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IPayment {
  id?: string
  enrollmentId?: string
  amount?: number
  method?: string
  status?: string
  paymentDate?: Date
  transactionId?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface IMessage {
  id?: string
  senderId: string
  receiverId: string
  senderRole: string
  receiverRole: string
  content: string
  subject?: string
  read?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface INotification {
  id?: string
  studentId: string
  title: string
  message: string
  type: 'info' | 'reminder' | 'alert'
  read?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IHifzProgress {
  id?: string
  studentId: string
  suraNumber: number
  ayaNumber: number
  status: 'not_started' | 'in_progress' | 'memorized'
  masteryLevel?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface IHifzGoal {
  id?: string
  studentId: string
  title: string
  description?: string
  status: string
  targetDate?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IRevisionSchedule {
  id?: string
  studentId: string
  suraNumber?: number
  ayaNumber?: number
  nextReviewDate: string
  intervalDays: number
  lastReviewedDate?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IRecitation {
  id?: string
  studentId?: string
  suraNumber?: number
  ayaNumber?: number
  audioUrl?: string | null
  score?: number | null
  feedback?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ITranslation {
  id?: string
  suraNumber: number
  ayaNumber: number
  translationText: string
  languageCode: string
  translatorName: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ITafsir {
  id?: string
  suraNumber: number
  ayaNumber: number
  tafsirText: string
  tafsirName: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IWordAnalysis {
  id?: string
  suraNumber: number
  ayaNumber: number
  wordNumber: number
  word: string
  transliteration?: string
  meaning?: string
  rootWord?: string
  partOfSpeech?: string
}

export interface IAssignment {
  id?: string
  courseId: string
  teacherId?: string | null
  title: string
  description?: string | null
  dueDate: Date
  maxPoints?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface ISubmission {
  id?: string
  assignmentId: string
  studentId: string
  submissionUrl?: string | null
  submissionText?: string | null
  submittedAt?: Date
  gradeId?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface IGrade {
  id?: string
  submissionId?: string | null
  assignmentId: string
  studentId: string
  teacherId?: string | null
  score: number
  feedback?: string | null
  gradedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IAttendance {
  id?: string
  classId?: string
  studentId?: string
  date?: string
  status?: string
  notes?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface IForum {
  id?: string
  name: string
  description?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ITopic {
  id?: string
  forumId: string
  title: string
  content?: string | null
  authorId: string
  authorRole: string
  isPinned?: boolean
  isLocked?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IPost {
  id?: string
  topicId: string
  content: string
  authorId: string
  authorRole: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IComment {
  id?: string
  postId: string
  content: string
  authorId: string
  authorRole: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IBadge {
  id?: string
  name: string
  description?: string | null
  iconUrl?: string | null
  criteria?: string | null
  rarity?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IUserBadge {
  id?: string
  studentId?: string
  badgeId?: string
  awardedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface ICurriculum {
  id?: string
  title: string
  description?: string | null
  level?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ILearningMaterial {
  id?: string
  curriculumId?: string | null
  title: string
  type?: string
  contentUrl?: string | null
  description?: string | null
  sequenceOrder?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface IInvoice {
  id?: string
  parentId?: string
  enrollmentId?: string | null
  amountDue?: number
  dueDate?: string
  issueDate?: Date
  status?: string
  fileUrl?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ICurriculumLesson {
  id?: string
  curriculumId?: string
  title: string
  description?: string | null
  sequenceOrder?: number
  content?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface IVirtualClassroom {
  id?: string
  classId?: string
  teacherId?: string
  title?: string
  description?: string | null
  scheduledTime?: Date
  endedAt?: Date | null
  status?: string
  meetingUrl?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ISessionParticipant {
  id?: string
  classroomId?: string
  userId?: string
  userType?: string
  joinedAt?: Date
  leftAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export interface IChatMessage {
  id?: string
  classroomId?: string
  senderId?: string
  senderType?: string
  message?: string
  sentAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface RegistrationRequest {
  parent: Omit<IParent, "id" | "createdAt" | "updatedAt">
  student: Omit<IStudent, "id" | "createdAt" | "updatedAt">
}

export interface QueryOptions {
  page?: number
  limit?: number
  sort?: string
  search?: string
  status?: string
  classId?: string
  courseId?: string
  teacherId?: string
  studentId?: string
  parentId?: string
  forumId?: string
  topicId?: string
  postId?: string
  assignmentId?: string
  gradeId?: string
  enrollmentId?: string
  submissionId?: string
  curriculumId?: string
  invoiceId?: string
  badgeId?: string
  date?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface RegistrationWithDetails {
  student: {
    id: string
    parentId: string
    firstName: string
    lastName: string
    dateOfBirth: string | Date
    age: number
    classId?: string | null
    registrationStatus: string
    createdAt: Date
    updatedAt: Date
  }
  parent: {
    id: string
    fatherFirstName: string
    fatherLastName: string
    fatherPhone: string
    fatherEmail: string
    motherFirstName?: string | null
    motherLastName?: string | null
    motherPhone?: string | null
    motherEmail?: string | null
  }
  class?: {
    id: string
    name: string
    startTime: string
    endTime: string
    ageMin: number
    ageMax: number
    maxStudents: number
    currentStudents: number
  } | null
  teacher?: {
    id: string
    name: string
    email: string
    phone: string
    specialization?: string | null
  } | null
}

