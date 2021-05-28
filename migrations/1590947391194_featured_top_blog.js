module.exports = {
  "up": function (conn, cb) {
    conn.query ("alter table c_blog add TOP char default 0 null;", function (err, res) {
      conn.query ("alter table c_blog add FEATURED char default 0 null;", function (err, res) {
        cb();
      });
    });},
  "down": "select * from c_blog"
};