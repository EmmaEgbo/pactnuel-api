exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_user ADD PUSHTOKEN VARCHAR(256) default NULL;");
};

exports.down = async function(knex) {
    await knex.raw("ALTER TABLE c_user DROP COLUMN PUSHTOKEN;");
};