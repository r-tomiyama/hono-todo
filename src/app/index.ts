import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { countByIsCompleted } from "@prisma/client/sql";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const app = new Hono();
const prisma = new PrismaClient();

app.use(requestId());
app.use(logger((arg) => console.log("標準ロガー", arg)));
app.use(async (c, next) => {
	console.log("カスタムロガー(request)", {
		req: {
			method: c.req.method,
			header: c.req.header,
			url: c.req.url,
			param: c.req.param(),
			body: await c.req.json().catch(() => null),
			requestId: c.get("requestId"),
		},
	});

	await next();

	console.log("カスタムロガー(response)", {
		res: {
			status: c.res.status,
			body:  await c.res.json().catch(() => null),
			requestId: c.get("requestId"),
		},
	});
});

app.get("/todos", async (c) => {
	const todos = await prisma.todo.findMany();
	return c.json(todos);
});

app.get("/todos/:id", async (c) => {
	const id = c.req.param("id");
	const todo = await prisma.todo.findUnique({ where: { id } });
	return c.json(todo);
});

app.get("/todos/completed/count", async (c) => {
	const res = await prisma.$queryRawTyped(countByIsCompleted(true));

	return c.json({ count: res[0].count || 0 });
});

const postSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
});
app.post(
	"/todos",
	zValidator("json", postSchema, (result, c) => {
		if (!result.success) {
			return c.json({ message: "bad request" }, 400);
		}
	}),
	async (c) => {
		const input = c.req.valid("json");
		const todo = await prisma.todo.create({
			data: {
				id: uuidv4(),
				title: input.title,
				description: input.description,
				isCompleted: false,
			},
		});
		return c.json(todo, 200);
	},
);

export default app;
