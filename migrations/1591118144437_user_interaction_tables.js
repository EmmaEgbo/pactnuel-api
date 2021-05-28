module.exports = {
  "up": function (conn, cb) {
    conn.query ("create table if not exists c_user_followed_categories\n" +
      "(\n" +
      "\tID varchar(20) not null\n" +
      "\t\tprimary key,\n" +
      "\tUSER_ID varchar(20) null,\n" +
      "\tCATEGORY_ID varchar(20) null,\n" +
      "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
      "\tconstraint c_user_categories_c_user_ID_fk\n" +
      "\t\tforeign key (USER_ID) references c_user (ID),\n" +
      "\tconstraint c_user_categories_c_category_ID_fk_1\n" +
      "\t\tforeign key (CATEGORY_ID) references c_category (ID)\n" +
      ");", function (err, res) {
      conn.query ("create table if not exists c_user_followed_authors\n" +
        "(\n" +
        "\tID varchar(20) not null\n" +
        "\t\tprimary key,\n" +
        "\tUSER_ID varchar(20) null,\n" +
        "\tAUTHOR_ID varchar(20) null,\n" +
        "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
        "\tconstraint c_user_authors_c_user_ID_fk\n" +
        "\t\tforeign key (USER_ID) references c_user (ID),\n" +
        "\tconstraint c_user_authors_c_author_ID_fk_1\n" +
        "\t\tforeign key (USER_ID) references c_user (ID)\n" +
        ");", function (err, res) {
        conn.query ("create table if not exists c_user_followed_publication\n" +
          "(\n" +
          "\tID varchar(20) not null\n" +
          "\t\tprimary key,\n" +
          "\tUSER_ID varchar(20) null,\n" +
          "\tPUBLICATION_ID varchar(20) null,\n" +
          "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
          "\tconstraint c_user_publication_c_user_ID_fk\n" +
          "\t\tforeign key (USER_ID) references c_user (ID),\n" +
          "\tconstraint c_user_publication_c_publication_ID_fk_1\n" +
          "\t\tforeign key (PUBLICATION_ID) references c_publication (ID)\n" +
          ");\n", function (err, res) {
          conn.query ("create table if not exists c_user_followed_blog\n" +
            "(\n" +
            "\tID varchar(20) not null\n" +
            "\t\tprimary key,\n" +
            "\tUSER_ID varchar(20) null,\n" +
            "\tBLOG_ID varchar(20) null,\n" +
            "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
            "\tconstraint c_user_blog_c_user_ID_fk\n" +
            "\t\tforeign key (USER_ID) references c_user (ID),\n" +
            "\tconstraint c_user_blog_c_blog_ID_fk_1\n" +
            "\t\tforeign key (BLOG_ID) references c_blog (ID)\n" +
            ");", function (err, res) {
            cb();
          });
        });
      });
    });
    },
  "down": "select * from c_blog"
};