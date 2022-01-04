exports.up = async function(knex) {
    return await knex.schema.createTable('c_user_tokens', function(t) {
        t.collate('latin1_swedish_ci')
        t.string('ID', 20).primary();
        t.string('TOKEN').notNullable();
        t.string('USER_ID', 20).notNullable();
        t.datetime ('EXPIRES').notNullable();
        t.boolean('BLACKLISTED', false).notNullable();
        t.foreign('USER_ID').references('ID').inTable('c_user').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('c_user_tokens');
};