exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_blog_comments DROP FOREIGN KEY c_blog_comments_c_UPDATED_BY_ID_fk;");
    await knex.raw("ALTER TABLE c_blog_comments ADD CONSTRAINT c_blog_comments_c_UPDATED_BY_ID_fk FOREIGN KEY (BLOG_ID) REFERENCES c_blog(ID) ON DELETE CASCADE ON UPDATE RESTRICT;");
};

exports.down = function(knex) {
    return knex.schema.alterTable('c_blog_comments', table => {
        table.dropForeign("BLOG_ID");
    });
};
