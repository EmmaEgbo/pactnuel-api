exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_blog ADD HTML JSON default NULL;");
};

exports.down = async function(knex) {
    await knex.raw("ALTER TABLE c_blog DROP COLUMN HTML;");
};