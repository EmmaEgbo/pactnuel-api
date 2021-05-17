exports.up = async function(knex) {
  await knex.raw("create table if not exists c_blog_comments\n" +
  "(\n" +
  "\tID varchar(20) not null\n" +
  "\t\tprimary key,\n" +
  "\tBLOG_ID varchar(20),\n" +
  "\tWEIGHT varchar(20),\n" +
  "\tCOMMENT varchar(1000),\n" +
  "\tSTATUS enum('POSTED', 'ARCHIVED', 'DELETED') not null,\n" +
  "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
  "\tUPDATED_AT timestamp null,\n" +
  "\tCREATED_BY varchar(20) not null,\n" +
  "\tUPDATED_BY varchar(20) null,\n" +
  "\tconstraint c_publication_CREATED_BY_ID_fk\n" +
  "\t\tforeign key (CREATED_BY) references c_user (ID),\n" +
  "\tconstraint c_blog_comments_UPDATED_BY_ID_fk\n" +
  "\t\tforeign key (UPDATED_BY) references c_user (ID),\n" +
  "\tconstraint c_blog_comments_c_UPDATED_BY_ID_fk\n" +
  "\t\tforeign key (BLOG_ID) references c_blog (ID)\n" +
  ");");
};

exports.down = async function(knex) {
  await knex.raw("DROP table c_blog_comments;");
};
