import { User, Material, Quiz, QuizAttempt, ChatMessage, StudentProgress, OfflineMaterial, Subject } from '@/types';

const DB_NAME = 'elearning_db';
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Users store
      if (!database.objectStoreNames.contains('users')) {
        const usersStore = database.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('role', 'role', { unique: false });
      }

      // Materials store
      if (!database.objectStoreNames.contains('materials')) {
        const materialsStore = database.createObjectStore('materials', { keyPath: 'id' });
        materialsStore.createIndex('teacherId', 'teacherId', { unique: false });
      }

      // Quizzes store
      if (!database.objectStoreNames.contains('quizzes')) {
        const quizzesStore = database.createObjectStore('quizzes', { keyPath: 'id' });
        quizzesStore.createIndex('teacherId', 'id_guru', { unique: false });
        quizzesStore.createIndex('subjectId', 'id_matapelajaran', { unique: false });
      }

      // Questions store
      if (!database.objectStoreNames.contains('questions')) {
        const questionsStore = database.createObjectStore('questions', { keyPath: 'id' });
        questionsStore.createIndex('quizId', 'id_kuis', { unique: false });
      }

      // Quiz attempts store
      if (!database.objectStoreNames.contains('quizAttempts')) {
        const attemptsStore = database.createObjectStore('quizAttempts', { keyPath: 'id' });
        attemptsStore.createIndex('quizId', 'quizId', { unique: false });
        attemptsStore.createIndex('studentId', 'studentId', { unique: false });
      }

      // Chat messages store
      if (!database.objectStoreNames.contains('chatMessages')) {
        const chatStore = database.createObjectStore('chatMessages', { keyPath: 'id' });
        chatStore.createIndex('materialId', 'materialId', { unique: false });
      }

      // Student progress store
      if (!database.objectStoreNames.contains('studentProgress')) {
        const progressStore = database.createObjectStore('studentProgress', { keyPath: 'id' });
        progressStore.createIndex('studentId', 'studentId', { unique: false });
      }

      // Offline materials store
      if (!database.objectStoreNames.contains('offlineMaterials')) {
        const offlineStore = database.createObjectStore('offlineMaterials', { keyPath: 'id' });
        offlineStore.createIndex('materialId', 'materialId', { unique: true });
      }

      // Subjects store
      if (!database.objectStoreNames.contains('subjects')) {
        database.createObjectStore('subjects', { keyPath: 'id' });
      }
    };
  });
};

// Generic CRUD operations
export const addItem = async <T extends { id?: string | number }>(storeName: string, item: T): Promise<T> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

export const updateItem = async <T extends { id?: string | number }>(storeName: string, item: T): Promise<T> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (storeName: string, id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getItem = async <T>(storeName: string, id: string): Promise<T | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getItemsByIndex = async <T>(
  storeName: string, 
  indexName: string, 
  value: string
): Promise<T[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getItemByIndex = async <T>(
  storeName: string, 
  indexName: string, 
  value: string
): Promise<T | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.get(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Seed demo data
export const seedDemoData = async () => {
  const users = await getAllItems<User>('users');
  if (users.length > 0) return; // Already seeded

  // Create demo users
  const demoUsers: User[] = [
    {
      id: 'admin-1',
      email: 'admin@elearn.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'teacher-1',
      email: 'teacher@elearn.com',
      name: 'Dr. Sarah Johnson',
      role: 'teacher',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'student-1',
      email: 'student@elearn.com',
      name: 'Alex Thompson',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
  ];

  for (const user of demoUsers) {
    await addItem('users', user);
  }

  // Create demo materials
  const demoMaterials: Omit<Material, 'id'>[] = [
    {
      mata_pelajaran_id: 1,
      teacher_id: 'teacher-1',
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
      file_type: 'pdf',
      file: 'web-dev-intro.pdf',
      fileName: 'web-dev-intro.pdf',
      fileSize: 2500000,
      file_url: '',
      teacherName: 'Dr. Sarah Johnson',
      createdAt: new Date().toISOString(),
      downloadCount: 45,
    },
    {
      mata_pelajaran_id: 1,
      teacher_id: 'teacher-1',
      title: 'React Fundamentals',
      description: 'Master React components, hooks, and state management',
      file_type: 'ppt',
      file: 'react-fundamentals.pptx',
      fileName: 'react-fundamentals.pptx',
      fileSize: 5000000,
      file_url: '',
      teacherName: 'Dr. Sarah Johnson',
      createdAt: new Date().toISOString(),
      downloadCount: 32,
    },
  ];

  for (const material of demoMaterials) {
    await addItem('materials', material as Material);
  }

  // Create demo quiz
  const demoQuiz: Quiz = {
    id: 'quiz-1',
    id_guru: 'teacher-1',
    id_matapelajaran: 1,
    judul_kuis: 'Web Development Basics Quiz',
    teacherName: 'Dr. Sarah Johnson',
    subjectName: 'Matematika',
    timeLimit: 15,
    createdAt: new Date().toISOString(),
    isPublished: true,
  };

  await addItem('quizzes', demoQuiz);
};
