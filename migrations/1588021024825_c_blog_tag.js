exports.up = async function(knex) {
  await knex.raw("create table if not exists c_blog_tag\n" +
  "(\n" +
  "\tID varchar(20) not null\n" +
  "\t\tprimary key,\n" +
  "\tBLOG_ID varchar(20),\n" +
  "\tTAG_ID varchar(20),\n" +
  "\tconstraint c_blog_tag_c_tags_ID_fk_1\n" +
  "\t\tforeign key (TAG_ID) references c_tags (ID),\n" +
  "\tconstraint c_blog_tag_c_blog_ID_fk\n" +
  "\t\tforeign key (BLOG_ID) references c_blog (ID)\n" +
  ");");
};

exports.down = async function(knex) {
  await knex.raw("DROP table c_blog_tag;");
};
