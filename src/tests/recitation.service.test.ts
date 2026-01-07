import { RecitationService } from '../services/recitation.service';
import { db } from '../db'; // Assuming db is exported
import { recitations } from '../db/schema'; // Assuming recitations schema is exported
import { eq } from 'drizzle-orm';

// Mock external dependencies
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      audio: {
        transcriptions: {
          create: jest.fn(() => Promise.resolve({ text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' })),
        },
      },
    };
  });
});

jest.mock('fs', () => ({
  // Mock all fs functions that are used
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  createReadStream: jest.fn((path) => ({
    // Mock createReadStream to return a mock stream
    pipe: jest.fn(),
  })),
}));

// Mock process.env variables
process.env.OPENAI_API_KEY = 'mock_openai_key';

// Mock the fetch API for getQuranDataFromCDN
const mockQuranData = [
  {
    number: 1,
    name: "الفاتحة",
    englishName: "Al-Fatihah",
    type: "Meccan",
    ayahs: [
      { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
      { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
      { number: 3, text: "مَالِكِ يَوْمِ الدِّينِ" },
    ],
  },
  {
    number: 112,
    name: "الإخلاص",
    englishName: "Al-Ikhlas",
    type: "Meccan",
    ayahs: [
      { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ" },
    ],
  },
];

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockQuranData),
  }) as Promise<Response>
);

// Mock drizzle-orm db operations
jest.mock('../db', () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => [
          {
            id: 'mock-recitation-id',
            studentId: 'mock-student-id',
            suraNumber: 1,
            ayaNumber: 1,
            audioUrl: '/uploads/mock-audio.webm',
            transcribedText: 'mock-transcribed-text',
            tajweedFeedback: { errors: [], overallScore: 100, summary: 'أداء ممتاز!' },
            score: 100,
            recitationDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      })),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => [
            {
              id: 'mock-recitation-id',
              studentId: 'mock-student-id',
              suraNumber: 1,
              ayaNumber: 1,
              audioUrl: '/uploads/mock-audio.webm',
              transcribedText: 'mock-transcribed-text',
              tajweedFeedback: { errors: [], overallScore: 100, summary: 'أداء ممتاز!' },
              score: 100,
              recitationDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        })),n      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve()),
    })),
  },
}));

describe('RecitationService', () => {
  let recitationService: RecitationService;

  // Mock the internal callTajweedMLService function (if needed, or just let it run the mock defined in the service itself)
  // If the mock is defined globally above, no need to mock it here unless you want to override for specific tests.
  let callTajweedMLServiceMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    recitationService = new RecitationService();

    // Spy on the mock ML service function if it's directly part of the module being tested
    const serviceModule = require('../services/recitation.service');
    callTajweedMLServiceMock = jest.spyOn(serviceModule, 'callTajweedMLService').mockImplementation(
      async (audioFilePath, suraNumber, ayaNumber, correctText) => {
        // Default mock implementation for ML service
        return {
          errors: [],
          overallScore: 100,
          summary: 'أداء ممتاز! لا توجد أخطاء تجويد واضحة.',
        };
      }
    );
  });

  describe('getQuranDataFromCDN', () => {
    it('should fetch and cache Quran data from CDN', async () => {
      // Clear cache to force a fetch
      (recitationService as any).quranDataCache = null; // Accessing private property for testing

      const quranData = await (recitationService as any).getQuranDataFromCDN();
      expect(fetch).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json'
      );
      expect(quranData).toHaveProperty(1);
      expect(quranData?.[1]).toHaveProperty(1);
      expect(quranData?.[1][1]).toBe('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    });

    it('should return cached data on subsequent calls', async () => {
      // Ensure cache is populated
      await (recitationService as any).getQuranDataFromCDN();
      // Clear fetch mock to check if it's called again
      (fetch as jest.Mock).mockClear();

      await (recitationService as any).getQuranDataFromCDN();
      expect(fetch).not.toHaveBeenCalled(); // Should use cached data
    });

    it('should handle fetch errors gracefully', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Not Found',
          json: () => Promise.resolve({}),
        })
      );
      (recitationService as any).quranDataCache = null; // Clear cache

      const quranData = await (recitationService as any).getQuranDataFromCDN();
      expect(quranData).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error loading Quran data from CDN:',
        expect.any(Error)
      );
    });
  });

  describe('getAyaText', () => {
    it('should return the correct Aya text', async () => {
      const ayaText = await (recitationService as any).getAyaText(1, 1);
      expect(ayaText).toBe('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    });

    it('should return null for non-existent Aya', async () => {
      const ayaText = await (recitationService as any).getAyaText(999, 999);
      expect(ayaText).toBeNull();
    });
  });

  describe('createRecitation', () => {
    it('should create a recitation, save locally, transcribe, call ML service, and save to DB', async () => {
      const mockCorrectText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
      const mockTranscribedText = 'بسم الله الرحمن الرحيم'; // Normalized version from Whisper
      const mockMLFeedback = {
        errors: [],
        overallScore: 95,
        summary: 'أداء جيد جداً مع بعض الملاحظات البسيطة.',
      };

      // Mock the getAyaText to return a known correct text
      const mockGetAyaText = jest.spyOn(recitationService as any, 'getAyaText');
      mockGetAyaText.mockResolvedValueOnce(mockCorrectText);

      // Mock OpenAI transcription
      (require('openai') as jest.Mock).mockImplementationOnce(() => {
        return {
          audio: {
            transcriptions: {
              create: jest.fn(() => Promise.resolve({ text: mockTranscribedText })),
            },
          },
        };
      });

      // Override the mock ML service for this specific test
      callTajweedMLServiceMock.mockResolvedValueOnce(mockMLFeedback);

      const recitationData = {
        studentId: 'test-student-id',
        suraNumber: 1,
        ayaNumber: 1,
      };
      const audioFilePath = '/tmp/test-audio.webm'; // Mock local file path
      const mimetype = 'audio/webm';

      const newRecitation = await recitationService.createRecitation(
        recitationData,
        audioFilePath,
        mimetype
      );

      expect(newRecitation).toBeDefined();
      expect(newRecitation.studentId).toBe('test-student-id');
      expect(newRecitation.audioUrl).toBe('/uploads/test-audio.webm'); // Expect local URL
      expect(newRecitation.transcribedText).toBe(mockTranscribedText); // Expect transcribed text
      expect(newRecitation.tajweedFeedback).toEqual(mockMLFeedback); // Expect detailed ML feedback
      expect(newRecitation.score).toBe(mockMLFeedback.overallScore);

      // Verify fs operations (createReadStream for Whisper)
      expect(require('fs').createReadStream).toHaveBeenCalledWith(audioFilePath);

      // Verify OpenAI transcription
      expect(require('openai')).toHaveBeenCalled();
      expect((require('openai') as jest.Mock).mock.results[0].value.audio.transcriptions.create).toHaveBeenCalled();

      // Verify ML service call
      expect(callTajweedMLServiceMock).toHaveBeenCalledWith(audioFilePath, recitationData.suraNumber, recitationData.ayaNumber, mockCorrectText);

      // Verify DB insert
      expect(db.insert).toHaveBeenCalledWith(recitations);
      expect(db.insert(recitations).values).toHaveBeenCalledWith(expect.objectContaining({
        studentId: 'test-student-id',
        suraNumber: 1,
        ayaNumber: 1,
        audioUrl: '/uploads/test-audio.webm',
        transcribedText: mockTranscribedText,
        tajweedFeedback: mockMLFeedback,
        score: mockMLFeedback.overallScore,
      }));
    });

    it('should handle errors from getAyaText', async () => {
      const mockGetAyaText = jest.spyOn(recitationService as any, 'getAyaText');
      mockGetAyaText.mockResolvedValueOnce(null); // Simulate API failure

      const recitationData = {
        studentId: 'test-student-id-error',
        suraNumber: 1,
        ayaNumber: 1,
      };
      const audioFilePath = '/tmp/test-audio-error.webm';
      const mimetype = 'audio/webm';

      const newRecitation = await recitationService.createRecitation(
        recitationData,
        audioFilePath,
        mimetype
      );

      expect(newRecitation).toBeDefined();
      expect(newRecitation.tajweedFeedback).toEqual(expect.objectContaining({
        summary: 'لم يتم العثور على نص قرآني صحيح لهذه السورة والآية. لا يمكن تقديم ملاحظات مفصلة.',
        overallScore: 0,
      }));
      expect(newRecitation.score).toBe(0);
      expect(callTajweedMLServiceMock).not.toHaveBeenCalled(); // ML service should not be called
    });

    it('should handle errors from ML service call', async () => {
      const mockCorrectText = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
      const mockTranscribedText = 'بسم الله الرحمن الرحيم';

      jest.spyOn(recitationService as any, 'getAyaText').mockResolvedValueOnce(mockCorrectText);
      (require('openai') as jest.Mock).mockImplementationOnce(() => {
        return {
          audio: {
            transcriptions: {
              create: jest.fn(() => Promise.resolve({ text: mockTranscribedText })),
            },
          },
        };
      });

      callTajweedMLServiceMock.mockRejectedValueOnce(new Error('ML service unavailable'));

      const recitationData = {
        studentId: 'test-ml-error-id',
        suraNumber: 1,
        ayaNumber: 1,
      };
      const audioFilePath = '/tmp/test-ml-error.webm';
      const mimetype = 'audio/webm';

      await expect(recitationService.createRecitation(
        recitationData,
        audioFilePath,
        mimetype
      )).rejects.toThrow('ML service unavailable');

      expect(callTajweedMLServiceMock).toHaveBeenCalled();
    });
  });

  describe('getRecitationById', () => {
    it('should fetch a recitation by ID', async () => {
      const mockRecitation = {
        id: 'mock-id',
        studentId: 'mock-student-id',
        suraNumber: 1,
        ayaNumber: 1,
        audioUrl: '/uploads/mock-audio.webm',
        transcribedText: 'بسم الله الرحمن الرحيم',
        tajweedFeedback: { errors: [], overallScore: 100, summary: 'أداء ممتاز!' },
        score: 100,
        recitationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (db.select().from(recitations).where as jest.Mock).mockReturnValueOnce({
        orderBy: jest.fn(() => Promise.resolve([mockRecitation])),
      });

      const recitation = await recitationService.getRecitationById('mock-id');
      expect(recitation).toBeDefined();
      expect(recitation?.id).toBe('mock-id');
      expect(recitation?.tajweedFeedback).toEqual(expect.objectContaining({ summary: 'أداء ممتاز!' }));
    });

    it('should return undefined if recitation is not found', async () => {
      (db.select().from(recitations).where as jest.Mock).mockReturnValueOnce({
        orderBy: jest.fn(() => Promise.resolve([])),
      });

      const recitation = await recitationService.getRecitationById('non-existent-id');
      expect(recitation).toBeUndefined();
    });
  });

  describe('getRecitationsByStudentId', () => {
    it('should fetch recitations by student ID', async () => {
      const mockRecitationsList = [
        {
          id: 'mock-id-1',
          studentId: 'mock-student-id',
          suraNumber: 1,
          ayaNumber: 1,
          audioUrl: '/uploads/mock-audio-1.webm',
          transcribedText: 'بسم الله الرحمن الرحيم',
          tajweedFeedback: { errors: [], overallScore: 90, summary: 'أداء جيد.' },
          score: 90,
          recitationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'mock-id-2',
          studentId: 'mock-student-id',
          suraNumber: 1,
          ayaNumber: 2,
          audioUrl: '/uploads/mock-audio-2.webm',
          transcribedText: 'الحمد لله رب العالمين',
          tajweedFeedback: { errors: [], overallScore: 100, summary: 'أداء ممتاز!' },
          score: 100,
          recitationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      (db.select().from(recitations).where as jest.Mock).mockReturnValueOnce({
        orderBy: jest.fn(() => Promise.resolve(mockRecitationsList)),
      });

      const recitationsList = await recitationService.getRecitationsByStudentId('mock-student-id');
      expect(recitationsList).toBeDefined();
      expect(recitationsList.length).toBe(2);
      expect(recitationsList[0].studentId).toBe('mock-student-id');
      expect(recitationsList[0].tajweedFeedback).toEqual(expect.objectContaining({ summary: 'أداء جيد.' }));
    });

    it('should return an empty array if no recitations are found for student ID', async () => {
      (db.select().from(recitations).where as jest.Mock).mockReturnValueOnce({
        orderBy: jest.fn(() => Promise.resolve([])),
      });

      const recitationsList = await recitationService.getRecitationsByStudentId('non-existent-student-id');
      expect(recitationsList).toEqual([]);
    });
  });

  describe('updateRecitation', () => {
    it('should update a recitation', async () => {
      const updateData = { score: 90, tajweedFeedback: { errors: [], overallScore: 90, summary: 'ملاحظات محدثة' } };
      const mockUpdatedRecitation = {
        id: 'mock-id',
        studentId: 'mock-student-id',
        suraNumber: 1,
        ayaNumber: 1,
        audioUrl: '/uploads/mock-audio.webm',
        transcribedText: 'بسم الله الرحمن الرحيم',
        tajweedFeedback: { errors: [], overallScore: 90, summary: 'ملاحظات محدثة' },
        score: 90,
        recitationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (db.update(recitations).set().where as jest.Mock).mockReturnValueOnce({
        returning: jest.fn(() => Promise.resolve([mockUpdatedRecitation])),
      });

      const updatedRecitation = await recitationService.updateRecitation('mock-id', updateData);
      expect(updatedRecitation).toBeDefined();
      expect(updatedRecitation?.score).toBe(90);
      expect(updatedRecitation?.tajweedFeedback).toEqual(expect.objectContaining({ summary: 'ملاحظات محدثة' }));
      expect(db.update).toHaveBeenCalledWith(recitations);
      expect(db.update(recitations).set).toHaveBeenCalledWith(expect.objectContaining({
        score: 90,
        tajweedFeedback: expect.objectContaining({ summary: 'ملاحظات محدثة' }),
      }));
    });

    it('should return undefined if recitation to update is not found', async () => {
      (db.update(recitations).set().where as jest.Mock).mockReturnValueOnce({
        returning: jest.fn(() => Promise.resolve([])),
      });

      const updatedRecitation = await recitationService.updateRecitation('non-existent-id', { score: 50 });
      expect(updatedRecitation).toBeUndefined();
    });
  });

  describe('deleteRecitation', () => {
    it('should delete a recitation', async () => {
      await recitationService.deleteRecitation('mock-id');
      expect(db.delete).toHaveBeenCalledWith(recitations);
      expect(db.delete(recitations).where).toHaveBeenCalledWith(eq(recitations.id, 'mock-id'));
    });
  });
});
