exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_blog_category DROP FOREIGN KEY c_blog_category_c_blog_ID_fk;");
    await knex.raw("ALTER TABLE c_blog_category ADD CONSTRAINT c_blog_category_c_blog_ID_fk FOREIGN KEY (BLOG_ID) REFERENCES c_blog(ID) ON DELETE CASCADE ON UPDATE RESTRICT;");
    await knex.raw("ALTER TABLE c_blog_category DROP FOREIGN KEY c_blog_category_c_category_ID_fk_1;");
    await knex.raw("ALTER TABLE c_blog_category ADD CONSTRAINT c_blog_category_c_category_ID_fk_1 FOREIGN KEY (CATEGORY_ID) REFERENCES c_category(ID) ON DELETE CASCADE ON UPDATE RESTRICT;");
};

exports.down = function(knex) {
    return knex.schema.alterTable('c_blog_category', table => {
        table.dropForeign("BLOG_ID");
        table.dropForeign("CATEGORY_ID");
    });
};
