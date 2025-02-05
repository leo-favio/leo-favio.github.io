// db.js

const DB_NAME = 'StickNotesDB';
const DB_VERSION = 1;
let db;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (event) {
      db = event.target.result;

      // Crear almacén de objetos para usuarios
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'username' });
        usersStore.createIndex('email', 'email', { unique: true });
      }

      // Crear almacén de objetos para notas
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        notesStore.createIndex('username', 'username', { unique: false });
        notesStore.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = function (event) {
      console.error('Error al abrir la base de datos:', event.target.errorCode);
      reject(event.target.error);
    };
  });
}

// Funciones auxiliares para interactuar con la base de datos

// Agregar usuario
function addUser(user) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const request = store.add(user);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

// Obtener usuario por nombre de usuario
function getUserByUsername(username) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const request = store.get(username);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

// Agregar nota
function addNote(note) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      const request = store.add(note);

      request.onsuccess = (event) => resolve(event.target.result); // Retorna el ID de la nota
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

// Actualizar nota
function updateNote(note) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      const request = store.put(note);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

// Eliminar nota por ID
function deleteNoteById(id) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

// Obtener notas por nombre de usuario
function getNotesByUsername(username) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const index = store.index('username');
      const request = index.getAll(username);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}
