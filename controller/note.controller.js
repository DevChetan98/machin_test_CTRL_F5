const db = require('../model/index'); 

exports.createNote = async (req, res) => {
    const { title, body } = req.body;
  
    const user_id=req.userId;
    const createNoteQuery = `
    INSERT INTO notes(title, body,user_id)
    VALUES(:title, :body, :user_id)
`;

db.sequelize.query(createNoteQuery, {
    replacements: { title,body,user_id },
    type: db.sequelize.QueryTypes.INSERT
}).then(async function (myTableRows) {
    return res.status(201).json({
        status: true,
        message: "Note successfully created",
        note: { id: myTableRows[0] }
    });
}).catch(err => {
    console.error("Error creating note:", err);
    return res.status(500).json({ status: false, message: "Failed to create note" });
});
};
exports.getAllNotes = async (req, res) => {
    try {
        const getAllNotesQuery = `
            SELECT * FROM notes
        `;
        const [notes, _] = await db.sequelize.query(getAllNotesQuery, {
            type: db.sequelize.QueryTypes.SELECT
        });

        return res.status(200).json({ status: true, notes });
    } catch (error) {
        console.error("Error retrieving notes:", error);
        return res.status(500).json({ status: false, message: "Failed to retrieve notes" });
    }
};


// Retrieve a specific note by ID
exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const getNoteByIdQuery = `
            SELECT * FROM notes
            WHERE id = :id
        `;
        const [note, _] = await db.sequelize.query(getNoteByIdQuery, {
            replacements: { id },
            type: db.sequelize.QueryTypes.SELECT
        });

        if (!note || note.length === 0) {
            return res.status(404).json({ status: false, message: "Note not found" });
        }

        return res.status(200).json({ status: true, note });
    } catch (error) {
        console.error("Error retrieving note by ID:", error);
        return res.status(500).json({ status: false, message: "Failed to retrieve note by ID" });
    }
};
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body } = req.body;

        const updateNoteQuery = `
            UPDATE notes
            SET title = :title, body = :body
            WHERE id = :id
        `;
        const [updatedRowsCount, _] = await db.sequelize.query(updateNoteQuery, {
            replacements: { id, title, body },
            type: db.sequelize.QueryTypes.UPDATE
        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ status: false, message: "Note not found" });
        }

        return res.status(200).json({ status: true, message: "Note updated successfully" });
    } catch (error) {
        console.error("Error updating note:", error);
        return res.status(500).json({ status: false, message: "Failed to update note" });
    }
};


exports.deleteNote = async (req, res) => {
    const noteId = req.params.id;

    // Custom delete query
    const deleteNoteQuery = `
        DELETE FROM notes
        WHERE id = ${noteId}
    `;

    try {
        // Execute the query
        const [result] = await db.sequelize.query(deleteNoteQuery);


        // Check if any rows were affected
        if (result.affectedRows > 0) {
            return res.status(200).json({ status: true, message: 'Note deleted successfully' });
        } else {
            return res.status(404).json({ status: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        return res.status(500).json({ status: false, message: 'Failed to delete note' });
    }
};


exports.searchNotes = async (req, res) => {
    try {
        const { query } = req.query;
    
        const searchNotesQuery = `
            SELECT * FROM notes
            WHERE title LIKE :query OR body LIKE :query
        `;
        
        const notes = await db.sequelize.query(searchNotesQuery, {
            replacements: { query: `%${query}%` },
            type: db.sequelize.QueryTypes.SELECT
        });
   
        return res.status(200).json({ status: true, message: "Successfully retrieved search results", data: notes });
       
    } catch (error) {
        console.error("Error searching notes:", error);
        return res.status(500).json({ status: false, message: "Failed to search notes" });
    }
};
