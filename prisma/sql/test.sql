select t.*, dod.* from todos t join definition_of_dones dod on t.id = dod.todo_id where t.is_completed = $1;
