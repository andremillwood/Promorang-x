/**
 * Generate a unique code for redemptions or other purposes
 * @param {string} table - Table name to check uniqueness
 * @param {string} column - Column name to check
 * @param {number} length - Code length (default: 8)
 * @returns {Promise<string>} Unique code
 */
async function generateUniqueCode(table, column, length = 8) {
    const { supabase } = require('../lib/supabase');

    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar characters
    let code;
    let isUnique = false;

    while (!isUnique) {
        // Generate random code
        code = '';
        for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if code exists
        const { data, error } = await supabase
            .from(table)
            .select(column)
            .eq(column, code)
            .single();

        // Code is unique if not found
        isUnique = error && error.code === 'PGRST116'; // PostgreSQL "no rows" error
    }

    return code;
}

module.exports = {
    generateUniqueCode,
};
