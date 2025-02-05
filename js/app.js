// app.js
const CONTENT_LIMIT = 35;
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que estamos en dashboard.html
    if (document.getElementById('notes-panel')) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        // Mostrar el nombre de usuario
        document.getElementById('username-display').textContent = loggedInUser.username;

        // Manejar cierre de sesión
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });

        // Variables y elementos DOM
        const addNoteBtn = document.getElementById('add-note-btn');
        const noteModal = document.getElementById('note-modal');
        const closeButton = document.querySelector('.close-button');
        const noteForm = document.getElementById('note-form');
        const notesContainer = document.getElementById('notes-container');
        const filterCategory = document.getElementById('filter-category');
        const modalTitle = document.getElementById('modal-title');
        let notes = [];
        let editingNoteId = null;

        // Eventos para abrir y cerrar el modal
        addNoteBtn.addEventListener('click', () => {
            editingNoteId = null;
            modalTitle.textContent = 'Nueva Nota';
            noteForm.reset();
            noteModal.style.display = 'block';
        });

        closeButton.addEventListener('click', () => {
            noteModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === noteModal) {
                noteModal.style.display = 'none';
            }
        });

        // Manejar envío del formulario de notas
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('note-title').value.trim();
            const category = document.getElementById('note-category').value.trim();
            const content = document.getElementById('note-content').value.trim();
        
            try {
                // Validar que no exista otra nota con el mismo título
                // Al agregar una nueva nota
                if (editingNoteId === null) {
                    const existingNotes = await getNotesByUsername(loggedInUser.username);
                    const duplicate = existingNotes.find(note => note.title.toLowerCase() === title.toLowerCase());
                    if (duplicate) {
                        alert('Ya existe una nota con este título. Por favor, elige otro título.');
                        return;
                    }
        
                    // Agregar nueva nota
                    const newNote = { username: loggedInUser.username, title, category, content };
                    await addNote(newNote);
                } else {
                    // Al editar una nota existente
                    const existingNotes = await getNotesByUsername(loggedInUser.username);
                    const duplicate = existingNotes.find(note =>
                        note.title.toLowerCase() === title.toLowerCase() && note.id !== editingNoteId
                    );
                    if (duplicate) {
                        alert('Ya existe otra nota con este título. Por favor, elige otro título.');
                        return;
                    }
        
                    // Actualizar nota existente
                    const updatedNote = { id: editingNoteId, username: loggedInUser.username, title, category, content };
                    await updateNote(updatedNote);
                    editingNoteId = null;
                }
        
                // Actualizar y renderizar las notas
                notes = await getNotesByUsername(loggedInUser.username);
                renderNotes(notes);
                noteModal.style.display = 'none';
            } catch (error) {
                console.error('Error al guardar la nota:', error);
                alert('Hubo un error al guardar la nota');
            }
        });

        function viewFullContent(note) {
            // Crear y mostrar el modal con el contenido completo
            const viewModal = document.createElement('div');
            viewModal.classList.add('modal');
            viewModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button view-close-button">&times;</span>
                    <h2>${note.title}</h2>
                    <p class="category">Categoría: ${note.category}</p>
                    <p>${note.content}</p>
                </div>
            `;
            document.body.appendChild(viewModal);
        
            // Mostrar el modal
            viewModal.style.display = 'block';
        
            // Evento para cerrar el modal
            viewModal.querySelector('.view-close-button').addEventListener('click', () => {
                viewModal.style.display = 'none';
                document.body.removeChild(viewModal);
            });
        
            // Cerrar el modal al hacer clic fuera del contenido
            window.addEventListener('click', (event) => {
                if (event.target === viewModal) {
                    viewModal.style.display = 'none';
                    document.body.removeChild(viewModal);
                }
            });
        }        

        
        // Renderizar notas
        function renderNotes(notesArray) {
            notesContainer.innerHTML = '';
            notesArray.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.classList.add('note-card');

                // Truncar el contenido si excede el límite
                let displayedContent = note.content;
                if (displayedContent.length > CONTENT_LIMIT) {
                    displayedContent = displayedContent.substring(0, CONTENT_LIMIT) + '...';
                }

                noteCard.innerHTML = `
                    <h3>${note.title}</h3>
                    <p class="category">Categoría: ${note.category}</p>
                    <p class="note-content">${displayedContent}</p>
                    <div class="card-actions">
                        <button class="edit-note">✏️</button>
                        <button class="delete-note">🗑️</button>
                    </div>
                `;

                // Evento para visualizar contenido completo al hacer clic
                noteCard.querySelector('.note-content').addEventListener('click', () => {
                    viewFullContent(note);
                });

                // Eventos para editar y eliminar
                noteCard.querySelector('.edit-note').addEventListener('click', () => {
                    editingNoteId = note.id;
                    modalTitle.textContent = 'Editar Nota';
                    document.getElementById('note-title').value = note.title;
                    document.getElementById('note-category').value = note.category;
                    // Cargar el contenido completo en el formulario de edición
                    document.getElementById('note-content').value = note.content;
                    noteModal.style.display = 'block';
                });

                noteCard.querySelector('.delete-note').addEventListener('click', async () => {
                    try {
                        await deleteNoteById(note.id);
                        notes = await getNotesByUsername(loggedInUser.username);
                        renderNotes(notes);
                    } catch (error) {
                        console.error('Error al eliminar la nota:', error);
                        alert('Hubo un error al eliminar la nota');
                    }
                });

                notesContainer.appendChild(noteCard);
            });
        }


        // Filtrado en tiempo real
        filterCategory.addEventListener('input', () => {
            const filterText = filterCategory.value.toLowerCase();
            const filteredNotes = notes.filter(note => note.category.toLowerCase().includes(filterText));
            renderNotes(filteredNotes);
        });

        // Inicializar notas
        (async function init() {
            try {
                notes = await getNotesByUsername(loggedInUser.username);
                renderNotes(notes);
            } catch (error) {
                console.error('Error al obtener las notas:', error);
            }
        })();
    }
});
