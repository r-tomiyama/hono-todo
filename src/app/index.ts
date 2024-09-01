
import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator"
import { PrismaClient } from '@prisma/client'
import { countByIsCompleted } from '@prisma/client/sql'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid';

const app = new Hono()
const prisma = new PrismaClient()

app.get('/todos', async (c) => {
  const todos = await prisma.todo.findMany()
  return c.json(todos)
})

app.get('/todos/:id', async (c) => {
  const id = c.req.param('id')
  const todo = await prisma.todo.findUnique({ where: { id } })
  return c.json(todo)
})

app.get('/todos/completed/count', async (c) => {
  const res = await prisma.$queryRawTyped(countByIsCompleted(true))

  return c.json({ count: res[0].count || 0 })
})

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})
app.post('/todos', zValidator("json", postSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: "bad request" }, 400);
  }
}), async (c) => {
  const input = c.req.valid("json");
  const todo = await prisma.todo.create({ data: {
    id: uuidv4(),
    title: input.title,
    description: input.description,
    isCompleted: false
  } })
  return c.json(todo)
})

export default app
