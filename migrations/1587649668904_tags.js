module.exports = {
  "up": "create table if not exists c_tags\n" +
    "(\n" +
    "\tID varchar(20) not null\n" +
    "\t\tprimary key,\n" +
    "\tNAME varchar(80) not null,\n" +
    "\tSTATUS varchar(40) default 'active' null,\n" +
    "\tCREATED_AT timestamp default CURRENT_TIMESTAMP NOT NULL,\n" +
    "\tUPDATED_AT timestamp default CURRENT_TIMESTAMP null\n" +
    ");\n" +
    "\n",
  "down": "drop table c_tags;"
}