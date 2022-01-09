exports.up = async function(knex) {
    await knex.raw("UPDATE `c_blog_comments` SET WEIGHT = 1;");
    return await knex.schema.alterTable('c_blog_comments', function(t) {
        t.string('PARENT_ID', 20).nullable();
        t.foreign('PARENT_ID').references('ID').inTable('c_blog_comments').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema.dropColumn('PARENT_ID');;
};