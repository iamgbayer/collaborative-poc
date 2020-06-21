const Y = require("yjs");
const buffer = require("lib0/dist/buffer.cjs");

const PGPool = require("pg").Pool;

/**
 * credentials is hardcoded to simplify, it's a temporary database.
 */
const db = new PGPool({
  connectionString:
    "postgres://fixsqfsa:rtlZWyWKQqvCxtru8Y1h6bKejxAsBVVf@ruby.db.elephantsql.com:5432/fixsqfsa",
});

module.exports = {
  bindState: (id, doc) => {
    console.log("get", id);

    db.query("SELECT state from documents WHERE id = $1 LIMIT 1", [id])
      .then((res) => {
        const state = res.rows[0]?.state;

        if (state) {
          Y.applyUpdate(doc, buffer.fromBase64(state));
        }
      })
      .catch((e) => {
        console.log("failed to load", id, e);
      });
  },

  writeState: async (id, doc) => {
    const state = Y.encodeStateAsUpdate(doc);

    return db
      .query("UPDATE documents SET state = $1 WHERE id = $2", [
        buffer.toBase64(state),
        id,
      ])
      .then((res) => {
        console.log("updated", res);
      })
      .catch((e) => {
        console.log("failed to update", id, e);
      });
  },
};
