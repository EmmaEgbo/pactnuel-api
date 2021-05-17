
exports.up = async function(knex) {
  await knex.raw("create table if not exists c_publication\n" +
      "(\n" +
      "\tID varchar(20) not null\n" +
      "\t\tprimary key,\n" +
      "\tTITLE text not null,\n" +
      "\tDESCRIPTION text null,\n" +
      "\tTAG_LINE text null,\n" +
      "\tAVATAR VARCHAR(20) null,\n" +
      "\tLOGO VARCHAR(20) null,\n" +
      "\tFACEBOOK_INFO varchar(255) null,\n" +
      "\tEMAIL_INFO varchar(255) null,\n" +
      "\tTWITTER_INFO varchar(255) null,\n" +
      "\tINSTAGRAM_INFO varchar(255) null,\n" +
      "\tAUTHOR_BY varchar(20) not null,\n" +
      "\tSHOW_ON_MENU char(1) not null default 0,\n" +
      "\tVIEWS int(20) default 0 not null,\n" +
      "\tSTATUS enum('ACTIVE', 'INACTIVE', 'ARCHIVE', 'DELETED','DRAFT','PUBLISHED') not null,\n" +
      "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
      "\tUPDATED_AT timestamp null,\n" +
      "\tALIAS varchar(256) not null,\n" +
      "\tconstraint c_publication_ALIAS_uindex\n" +
      "\t\tunique (ALIAS),\n" +
      "\tconstraint c_publication_c_user_ID_fk\n" +
      "\t\tforeign key (AUTHOR_BY) references c_user (ID),\n" +
      "\tconstraint c_publication_avatar_ID_fk\n" +
      "\t\tforeign key (AVATAR) references c_file (ID),\n" +
      "\tconstraint c_publication_logo_ID_fk\n" +
      "\t\tforeign key (LOGO) references c_file (ID)\n" +
      ");\n" +
      "\n");  
};

exports.down = async function(knex) {
  await knex.raw("drop table c_publication;")
};