const express = require("express");
const router = express.Router();
const db = require("../data/database");

router.get("/", (req, res) => {
  res.redirect("/posts");
});

router.get("/posts", async (req, res) => {
  const [posts] = await db.query(
    "SELECT posts.*, authors.name AS author_name FROM posts INNER JOIN authors ON posts.author_id = authors.id"
  );
  res.render("posts-list", { posts: posts });
});

router.post("/posts", async (req, res) => {
  const post = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  console.log(post);
  await db.query(
    "INSERT INTO posts(title, summary, body, author_id) VALUES(?)",
    [post]
  );
  res.redirect("/posts");
});

router.get("/new-post", async (req, res) => {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  const [post] = await db.query(
    `SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts 
    INNER JOIN authors 
    ON posts.author_id = authors.id 
    WHERE posts.id= ?`,
    [postId]
  );

  if (post.length === 0 || !post) {
    return res.status(404).render("404");
  }
  const postData = {
    ...post[0],
    date: post[0].date.toISOString(),
    humanDate: new Date(post[0].date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async (req, res) => {
  const postId = req.params.id;
  const [post] = await db.query(
    "SELECT posts.*, authors.name AS author_name FROM posts INNER JOIN authors ON authors.id = posts.author_id WHERE posts.id=?",
    [postId]
  );

  if (!post || post.length === 0) {
    return res.render("404");
  }
  res.render("update-post", { post: post[0] });
});

router.post("/posts/:id/eidt", async (req, res) => {
  console.log(req.body);
  await db.query("UPDATE posts SET title=?, summary=?, body=? WHERE id=?", [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);
  res.redirect("/posts");
});

router.post("/posts/:id/delete", async (req, res) => {
  await db.query("DELETE FROM posts WHERE id=?", [req.params.id]);
  res.redirect("/posts");
});

module.exports = router;
