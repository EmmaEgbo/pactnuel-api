exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_blog_tag DROP FOREIGN KEY c_blog_tag_c_blog_ID_fk;");
    await knex.raw("ALTER TABLE c_blog_tag ADD CONSTRAINT c_blog_tag_c_blog_ID_fk FOREIGN KEY (BLOG_ID) REFERENCES c_blog(ID) ON DELETE CASCADE ON UPDATE RESTRICT;");
    await knex.raw("ALTER TABLE c_blog_tag DROP FOREIGN KEY c_blog_tag_c_tags_ID_fk_1;");
    await knex.raw("ALTER TABLE c_blog_tag ADD CONSTRAINT c_blog_tag_c_tags_ID_fk_1 FOREIGN KEY (TAG_ID) REFERENCES c_tags(ID) ON DELETE CASCADE ON UPDATE RESTRICT;");
};

exports.down = function(knex) {
    return knex.schema.alterTable('c_blog_tag', table => {
        table.dropForeign("BLOG_ID");
        table.dropForeign("TAG_ID");
    });
};
