const Router = require("express-promise-router");

const db = require("../db");
const { mkTable, mkForm, wrap } = require("./markup.js");
const { sqlsanitize } = require("./utils.js");

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

// export our router to be mounted by the parent application
module.exports = router;

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const fq = await db.query("SELECT * FROM fields WHERE id = $1", [id]);
  const field = fq.rows[0];

  res.send(
    wrap(
      `Edit field`,
      mkForm(
        "/field",
        [
          { name: "id", input_type: "hidden" },
          { name: "table_id", input_type: "hidden" },
          { label: "Name", name: "fname", input_type: "text" },
          { label: "Label", name: "flabel", input_type: "text" },
          { label: "Type", name: "ftype", input_type: "text" }
        ],
        field
      )
    )
  );
});
router.get("/new/:table_id", async (req, res) => {
  const { table_id } = req.params;

  res.send(
    wrap(
      `New field`,
      mkForm(
        "/field",
        [
          { name: "table_id", input_type: "hidden" },
          { label: "Name", name: "fname", input_type: "text" },
          { label: "Label", name: "flabel", input_type: "text" },
          { label: "Type", name: "ftype", input_type: "text" }
        ],
        { table_id }
      )
    )
  );
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  
  const {
    rows
  } = await db.query("delete FROM fields WHERE id = $1 returning *", [id]);
  res.redirect(`/table/${rows[0].table_id}`);
});

router.post("/", async (req, res) => {
  const v = req.body;
  if (typeof v.id === "undefined") {
    // insert
    const tq = await db.query("SELECT * FROM tables WHERE id = $1", [v.table_id]);
    const tname = tq.rows[0].name;
    await db.query(
        `alter table ${sqlsanitize(tname)} add column ${sqlsanitize(v.fname)} ${sqlsanitize(v.ftype)}`      
      );
    await db.query(
      "insert into fields(table_id, fname, flabel, ftype) values($1,$2,$3,$4)",
      [v.table_id, v.fname, v.flabel, v.ftype]
    );
  } else {
      // update
      //TODO edit field
    await db.query(
      "update fields set table_id=$1, fname=$2, flabel=$3, ftype=$4 where id=$5",
      [v.table_id, v.fname, v.flabel, v.ftype, v.id]
    );
  }
  res.redirect(`/table/${v.table_id}`);
});
