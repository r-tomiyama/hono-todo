import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator"
import { PrismaClient } from '@prisma/client'
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

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
