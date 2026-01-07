import { database } from "../config/database";
import { recitations } from "../db/schema";
import { IRecitation } from "../types";
import { eq, desc } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Note: OpenAI integration is optional - it will be used if OPENAI_API_KEY is set
let openai: any = null;
try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai').default;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (e) {
  console.log('OpenAI module not installed, Whisper transcription disabled');
}


// CDN URL for risan/quran-json
const QURAN_CDN_URL = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json";

let quranDataCache: { [sura: number]: { [aya: number]: string } } | null = null;

// Helper function to load Quran data from CDN and cache it
async function getQuranDataFromCDN(): Promise<{ [sura: number]: { [aya: number]: string } } | null> {
  if (quranDataCache) {
    return quranDataCache;
  }

  try {
    // Using node-fetch here as axios might not be globally available if not explicitly imported for this function.
    // If axios is preferred, ensure it's imported here.
    const response = await fetch(QURAN_CDN_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Quran data from CDN: ${response.statusText}`);
    }
    const rawData: any[] = await response.json() as any[];

    const processedData: { [sura: number]: { [aya: number]: string } } = {};
    rawData.forEach((sura: any) => {
      processedData[sura.number] = {};
      sura.ayahs.forEach((ayah: any) => {
        processedData[sura.number][ayah.number] = ayah.text;
      });
    });
    quranDataCache = processedData;
    return quranDataCache;
  } catch (error) {
    console.error("Error loading Quran data from CDN:", error);
    return null;
  }
}

// Helper function to get Aya text from the loaded cache
async function getAyaText(suraNumber: number, ayaNumber: number): Promise<string | null> {
  const quranData = await getQuranDataFromCDN();
  if (!quranData) {
    return null;
  }
  return quranData[suraNumber]?.[ayaNumber] || null;
}

// Define a structure for the detailed Tajweed feedback from the ML service
interface DetailedTajweedFeedback {
  errors: Array<{
    type: string; // e.g., "Madd", "Ghunnah", "Haraka"
    location: {
      wordIndex: number;
      charIndex?: number;
      startTime?: number; // In seconds, from audio
      endTime?: number;   // In seconds, from audio
    };
    description: string; // Detailed description of the error
    severity: "low" | "medium" | "high";
    suggestion: string; // Suggestion for correction
  }>;
  overallScore: number; // Overall score from 0-100
  summary: string;      // A human-readable summary of the recitation feedback
}

// Mock function to simulate calling an external ML service for Tajweed analysis
async function callTajweedMLService(audioFilePath: string, suraNumber: number, ayaNumber: number, correctText: string): Promise<DetailedTajweedFeedback> {
  console.log(`Mock ML Service: Analyzing audio from ${audioFilePath} for Sura ${suraNumber}, Aya ${ayaNumber}`);
  console.log(`Mock ML Service: Correct text is: ${correctText}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate some detailed feedback
  const mockErrors: DetailedTajweedFeedback['errors'] = [];
  let mockOverallScore = 100;
  let mockSummary = `أداء ممتاز! لا توجد أخطاء تجويد واضحة.`;

  // Simulate common errors for demonstration
  if (suraNumber === 1 && ayaNumber === 1) { // Al-Fatiha, Aya 1: بسم الله الرحمن الرحيم
    // Simulate a common error like missing Madd
    mockErrors.push({
      type: "Madd",
      location: { wordIndex: 2, charIndex: 2, startTime: 1.2, endTime: 1.5 },
      description: "مد طبيعي في كلمة 'الرحمن' لم يتم إطالته بشكل كافٍ.",
      severity: "medium",
      suggestion: "يرجى إطالة حرف الألف في 'الرحمن' لمدة حركتين.",
    });
    mockOverallScore -= 10;
    mockSummary = `تم اكتشاف بعض أخطاء المد في التلاوة.`;
  } else if (suraNumber === 112 && ayaNumber === 1) { // Al-Ikhlas, Aya 1: قل هو الله أحد
    // Simulate a common error like incorrect Ghunnah
    mockErrors.push({
      type: "Ghunnah",
      location: { wordIndex: 3, charIndex: 0, startTime: 0.8, endTime: 1.1 },
      description: "غنة ناقصة في حرف النون الساكنة في 'أحد'.",
      severity: "high",
      suggestion: "يرجى تطبيق غنة كاملة لمدة حركتين عند النون الساكنة.",
    });
    mockOverallScore -= 15;
    mockSummary = `تم اكتشاف أخطاء في الغنة.`;
  } else if (suraNumber === 1 && ayaNumber === 2) { // Al-Fatiha, Aya 2: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
    // Simulate pronunciation error
    mockErrors.push({
      type: "Pronunciation",
      location: { wordIndex: 0, charIndex: 1, startTime: 0.1, endTime: 0.3 },
      description: "نطق حرف 'الحاء' كان قريبًا من 'الهاء'.",
      severity: "medium",
      suggestion: "تدرب على مخرج حرف 'الحاء' من وسط الحلق.",
    });
    mockErrors.push({
      type: "Madd",
      location: { wordIndex: 4, charIndex: 5, startTime: 2.0, endTime: 2.5 },
      description: "مد عارض للسكون في 'العالمين' لم يطبق بشكل صحيح.",
      severity: "low",
      suggestion: "يمكن مد الألف في 'العالمين' 2 أو 4 أو 6 حركات عند الوقف.",
    });
    mockOverallScore -= 5;
    mockSummary = `بعض الأخطاء في النطق والمد.`;
  }

  return {
    errors: mockErrors,
    overallScore: Math.max(0, mockOverallScore), // Ensure score is not negative
    summary: mockSummary,
  };
}

export class RecitationService {
  async createRecitation(
    recitationData: Omit<IRecitation, "id" | "createdAt" | "updatedAt" | "recitationDate" | "tajweedFeedback" | "score" | "audioUrl">,
    audioFilePath: string,
    mimetype: string
  ): Promise<IRecitation> {
    let audioUrl: string = "";
    let transcribedText: string = "";
    let tajweedFeedback: DetailedTajweedFeedback = { errors: [], overallScore: 0, summary: "لم يتم توفير ملاحظات" };
    let score: number = 0;

    try {
      // 1. Set audioUrl to the local file path
      audioUrl = `/uploads/${path.basename(audioFilePath)}`; // Construct URL using basename

      // 2. Transcribe audio using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath) as any, // Use the provided file path for transcription
        model: "whisper-1",
        language: "ar",
      });
      transcribedText = transcription.text.trim();

      // 3. Analyze Tajweed using the (mock) ML service
      const suraNum = recitationData.suraNumber ?? 0;
      const ayaNum = recitationData.ayaNumber ?? 0;
      const correctText = await getAyaText(suraNum, ayaNum);

      if (correctText) {
        const mlFeedback = await callTajweedMLService(audioFilePath, suraNum, ayaNum, correctText);
        tajweedFeedback = mlFeedback;
        score = mlFeedback.overallScore;
      } else {
        tajweedFeedback.summary = "لم يتم العثور على نص قرآني صحيح لهذه السورة والآية. لا يمكن تقديم ملاحظات مفصلة.";
        score = 0;
      }

      // 4. Save recitation details to database
      const db = database.getDb();
      const [newRecitation] = await db.insert(recitations).values({
        ...recitationData as any,
        audioUrl,
        transcribedText,
        tajweedFeedback: JSON.stringify(tajweedFeedback),
        score: Math.round(score),
        recitationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any).returning();
      return newRecitation as IRecitation;
    } catch (error) {
      console.error("Error in createRecitation:", error);
      throw error;
    }
  }

  async getRecitationById(id: string): Promise<IRecitation | undefined> {
    const db = database.getDb();
    const [recitation] = await db.select().from(recitations).where(eq(recitations.id, id));
    return recitation as IRecitation | undefined;
  }

  async getRecitationsByStudentId(studentId: string): Promise<IRecitation[]> {
    const db = database.getDb();
    const recs = await db.select().from(recitations).where(eq(recitations.studentId, studentId)).orderBy(desc(recitations.recitationDate));
    return recs as IRecitation[];
  }

  async updateRecitation(id: string, updateData: Partial<Omit<IRecitation, "id" | "studentId" | "createdAt" | "recitationDate">>): Promise<IRecitation | undefined> {
    const db = database.getDb();
    const [updatedRecitation] = await db.update(recitations).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(recitations.id, id)).returning();
    return updatedRecitation as IRecitation | undefined;
  }

  async deleteRecitation(id: string): Promise<void> {
    const db = database.getDb();
    await db.delete(recitations).where(eq(recitations.id, id));
  }
}
