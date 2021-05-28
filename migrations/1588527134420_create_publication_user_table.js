module.exports = {
    "up": "create table c_publication_user\n" +
      "(\n" +
      "\tID varchar(20) not null\n" +
      "\t\tprimary key,\n" +
      "\tPUBLICATION_ID varchar(20) null,\n" +
      "\tUSER_ID varchar(20) null,\n" +
      "\tTYPE enum('OWNER', 'EDITOR', 'WRITER') not null,\n" +
      "\tconstraint c_publication_user_c_publication_ID_fk\n" +
      "\t\tforeign key (PUBLICATION_ID) references c_publication (ID),\n" +
      "\tconstraint c_publication_user_c_user_ID_fk_1\n" +
      "\t\tforeign key (USER_ID) references c_user (ID)\n" +
      ");\n",
    "down": "drop table c_publication_user;"
}