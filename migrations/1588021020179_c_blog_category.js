module.exports = {
        "up": "create table if not exists c_blog_category\n" +
          "(\n" +
          "\tID varchar(20) not null\n" +
          "\t\tprimary key,\n" +
          "\tBLOG_ID varchar(20),\n" +
          "\tCATEGORY_ID varchar(20),\n" +
          "\tconstraint c_blog_category_c_category_ID_fk_1\n" +
          "\t\tforeign key (CATEGORY_ID) references c_category (ID),\n" +
          "\tconstraint c_blog_category_c_blog_ID_fk\n" +
          "\t\tforeign key (BLOG_ID) references c_blog (ID)\n" +
          ");",
    "down": "DROP table c_blog_category;"
}