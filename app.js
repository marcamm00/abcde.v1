const DB_NAME = 'DiarioRP_Database';
const DB_VERSION = 1;
const STORE_NAME = 'rp_entries';

// Funzione universale per aprire il DB
function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => {
            console.error("Errore IndexedDB:", e.target.error);
            reject(e.target.error);
        };
    });
}

// Funzione SALVA
async function saveEntry(entry) {
    try {
        const db = await getDB();
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(entry);
        tx.oncomplete = () => {
            alert("Salvato correttamente!");
            window.location.href = 'index.html';
        };
    } catch (err) {
        alert("Errore salvataggio: " + err);
    }
}

// Funzione CARICA TUTTI (per lo storico)
async function getEntries(callback) {
    try {
        const db = await getDB();
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            const data = request.result.sort((a, b) => b.id - a.id);
            callback(data);
        };
    } catch (err) {
        console.error("Errore recupero dati:", err);
        callback([]);
    }
}

// Funzione CARICA SINGOLO
async function getEntryById(id, callback) {
    try {
        const db = await getDB();
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(Number(id));
        request.onsuccess = () => callback(request.result);
    } catch (err) {
        console.error("Errore recupero record:", err);
    }
}

// Funzione ELIMINA
async function deleteEntry(id) {
    if (confirm("Vuoi eliminare questo RP?")) {
        const db = await getDB();
        const tx = db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).delete(Number(id));
        tx.oncomplete = () => {
            window.location.href = 'index.html';
        };
    }
}
