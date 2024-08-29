-- CreateTable
CREATE TABLE "definition_of_dones" (
    "id" TEXT NOT NULL,
    "todo_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "definition_of_dones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "definition_of_dones" ADD CONSTRAINT "definition_of_dones_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
