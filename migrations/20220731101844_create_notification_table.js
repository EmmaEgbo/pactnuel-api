exports.up = async function(knex) {
    return await knex.schema.createTable('c_user_notifications', function(t) {
        t.collate('latin1_swedish_ci')
        t.string('ID', 20).primary();
        t.string('USER_TO', 20).notNullable();
        t.string('USER_FROM', 20).notNullable();
        t.boolean('OPENED').defaultTo(false)
        t.string('NOTIFICATION_TYPE').notNullable();
        t.string('NOTIFICATION_IMAGE').nullable();
        t.string('TITLE').notNullable();
        t.string('CONTENT').notNullable();
        t.string('ENTITY_ID').notNullable();
        t.timestamp('CREATED_AT').defaultTo(knex.fn.now());
        t.foreign('USER_TO').references('ID').inTable('c_user').onDelete('CASCADE');
        t.foreign('USER_FROM').references('ID').inTable('c_user').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('c_user_notifications');
};