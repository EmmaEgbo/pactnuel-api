exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_user ADD DELETED BOOLEAN DEFAULT FALSE;");
};

exports.down = async function(knex) {
    await knex.raw("ALTER TABLE c_user DROP COLUMN DELETED;");
};