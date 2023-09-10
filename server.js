const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = 8000;

app.use(express.json());

// 初期データ 挿入
app.post("/seed", async (req, res) => {
  const userData = [
    { email: "aaaaa@example.com", name: "first" },
    { email: "bbbbb@example.com", name: "second" },
    { email: "ccccc@example.com", name: "third" },
    { email: "ddddd@example.com", name: "fourth" },
    {
      email: "eeeee@example.com",
      name: "fifth",
      posts: { create: { title: "5番目", content: "こんにちは" } },
    },
  ];

  for (let user of userData) {
    await prisma.users.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: user,
    });
  }
  const users = await prisma.users.findMany({});
  return res.json(users);
});

// 全ユーザ 取得
app.get("/", async (req, res) => {
  const users = await prisma.users.findMany();
  return res.json(users);
});

// ユーザ 追加
app.post("/", async (req, res) => {
  const { email, name } = req.body;
  const user = await prisma.users.create({
    data: {
      email: email,
      name: name,
      posts: {
        create: {
          title: "こんにちは",
          content: "内容です。",
        },
      },
    },
  });
  console.log(user);
  return res.json(user);
});

// ユーザ 削除
app.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deletedUser = await prisma.users.delete({
    where: {
      id: Number(id),
    },
  });
  return res.json(deletedUser);
});

// コメント 削除
// トランザクション管理
app.delete("/posts/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.posts.delete({
        where: {
          id: Number(id),
        },
      });
    });
  } catch (err) {
    return res.json(err.body);
  }
  return res.json({ message: `投稿削除 id: ${id}` });
});

app.listen(PORT, () => {
  console.log(`起動中 port: ${PORT}`);
});
