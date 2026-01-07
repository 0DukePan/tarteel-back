import { database } from "../config/database";
import { quranTranslations, quranTafsirs, quranWordAnalysis } from "../db/schema";
import { ITranslation, ITafsir, IWordAnalysis } from "../types";
import { eq, and } from "drizzle-orm";
import { logger } from "../config/logger";

const TAFSIR_API_CDN_BASE_URL = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";

function getDb() {
  return database.getDb();
}

export class TafsirService {

  // --- Internal helper functions to fetch from CDN ---
  private async fetchFromCdn(path: string): Promise<any | null> {
    const url = `${TAFSIR_API_CDN_BASE_URL}${path}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.error(`Failed to fetch from CDN: ${url}. Status: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error: any) {
      logger.error(`Failed to fetch from CDN: ${url}. Error: ${error.message}`);
      return null;
    }
  }

  // --- Translations ---
  async getTranslation(suraNumber: number, ayaNumber: number, languageCode: string, translatorName: string): Promise<ITranslation | undefined> {
    const db = getDb();
    // 1. Try to get from our database
    const [existingTranslation] = await db.select()
      .from(quranTranslations)
      .where(and(
        eq(quranTranslations.suraNumber, suraNumber),
        eq(quranTranslations.ayaNumber, ayaNumber),
        eq(quranTranslations.languageCode, languageCode),
        eq(quranTranslations.translatorName, translatorName)
      ));

    if (existingTranslation) {
      return existingTranslation as ITranslation;
    }

    // 2. If not in DB, fetch from CDN
    let editionSlug: string;
    if (languageCode === 'en' && translatorName === 'Al-Jalalayn') {
      editionSlug = 'en-al-jalalayn';
    } else {
      logger.warn(`CDN slug mapping not found for languageCode: ${languageCode}, translatorName: ${translatorName}`);
      return undefined;
    }

    const cdnData = await this.fetchFromCdn(`/${editionSlug}/${suraNumber}/${ayaNumber}.json`);

    if (cdnData && cdnData.text) {
      const newTranslation = {
        suraNumber,
        ayaNumber,
        languageCode,
        translatorName,
        translationText: cdnData.text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const [insertedTranslation] = await db.insert(quranTranslations).values(newTranslation as any).returning();
      return insertedTranslation as ITranslation;
    }

    return undefined;
  }

  // --- Tafsirs ---
  async getTafsir(suraNumber: number, ayaNumber: number, tafsirName: string): Promise<ITafsir | undefined> {
    const db = getDb();
    // 1. Try to get from our database
    const [existingTafsir] = await db.select()
      .from(quranTafsirs)
      .where(and(
        eq(quranTafsirs.suraNumber, suraNumber),
        eq(quranTafsirs.ayaNumber, ayaNumber),
        eq(quranTafsirs.tafsirName, tafsirName)
      ));

    if (existingTafsir) {
      return existingTafsir as ITafsir;
    }

    // 2. If not in DB, fetch from CDN
    let editionSlug: string;
    if (tafsirName === 'Al-Jalalayn') {
      editionSlug = 'ar-al-jalalayn';
    } else if (tafsirName === 'Tafsir Ibn Kathir') {
      editionSlug = 'ar-tafsir-ibn-kathir';
    } else {
      logger.warn(`CDN slug mapping not found for tafsirName: ${tafsirName}`);
      return undefined;
    }

    const cdnData = await this.fetchFromCdn(`/${editionSlug}/${suraNumber}/${ayaNumber}.json`);

    if (cdnData && cdnData.text) {
      const newTafsir = {
        suraNumber,
        ayaNumber,
        tafsirName,
        tafsirText: cdnData.text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const [insertedTafsir] = await db.insert(quranTafsirs).values(newTafsir as any).returning();
      return insertedTafsir as ITafsir;
    }

    return undefined;
  }

  // --- Word Analysis (Placeholder for now) ---
  async getWordAnalysis(suraNumber: number, ayaNumber: number, wordNumber: number): Promise<IWordAnalysis | undefined> {
    logger.info(`Placeholder: No word-by-word analysis available for Sura ${suraNumber}, Aya ${ayaNumber}, Word ${wordNumber}`);
    return undefined;
  }

  // Optional: Fetch editions list for dynamic UI
  async getAvailableEditions(): Promise<any | null> {
    return this.fetchFromCdn('/editions.json');
  }
}
