exports.up = async function(knex) {
    return await knex.schema.createTable('c_blog_likes', function(t) {
        t.collate('latin1_swedish_ci')
        t.string('ID', 20).primary();
        t.string('BLOG_ID', 20).notNullable();
        t.string('USER_ID', 20).notNullable();
        t.foreign('BLOG_ID').references('ID').inTable('c_blog').onDelete('CASCADE');
        t.foreign('USER_ID').references('ID').inTable('c_user').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('c_blog_likes');
};