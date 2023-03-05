exports.up = async function(knex) {
    return await knex.schema.createTable('c_user_report', function(t) {
        t.collate('latin1_swedish_ci')
        t.string('ID', 20).primary();
        t.string('USER_ID', 20).notNullable();
        t.string('REPORTED_USER_ID', 20).notNullable();
        t.timestamp('CREATED_AT').defaultTo(knex.fn.now());
        t.foreign('USER_ID').references('ID').inTable('c_user').onDelete('CASCADE');
        t.foreign('REPORTED_USER_ID').references('ID').inTable('c_user').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('c_user_report');
};