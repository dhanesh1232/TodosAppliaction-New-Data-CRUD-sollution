const express = require("express");
const addDays = require("date-fns/addDays");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const getCategoryAndPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined &&
    requestQuery.priority !== undefined &&
    requestQuery.category !== undefined
  );
};
const getPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const getCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};
const getCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};
const getStatusProperties = (requestData) => {
  return requestData.status !== undefined;
};
const getPriorityProperties = (requestData) => {
  return requestData.priority !== undefined;
};
const getCategoryProperties = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", category, status, priority } = request.query;
  console.log(request.query);
  let data = null;
  let getTodoQuery = "";
  switch (true) {
    case getCategoryAndPriorityAndStatusProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}'
        AND category = '${category}';`;
      break;
    case getPriorityAndStatusProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case getCategoryAndStatusProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
      break;
    case getCategoryAndPriorityProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND category = '${category}';`;
      break;
    case getStatusProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    case getCategoryProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
      break;
    case getPriorityProperties(request.query):
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    default:
      getTodoQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      break;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id='${todoId}';`;
  const todoData = await db.get(getTodoQuery);
  response.send(todoData);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const getDateQuery = `SELECT * FROM todo WHERE due_date='${date}';`;
  const dateArray = await db.all(getDateQuery);
  response.send(dateArray);
});

app.post("/todos/", async (request, response) => {
  console.log(request.body);
  const { id, todo, priority, status, category, dueDate } = request.body;
  console.log(id);
  const addTodoQuery = `INSERT INTO todo (id,todo,priority,status,category,due_date)
  VALUES
  (
      '${id}',
      '${todo}',
      '${priority}',
      '${status}',
      '${category}',
      '${dueDate}'
  );`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let data = null;
  let updateTodoQuery;
  switch (true) {
    case requestBody.status !== undefined:
      updateTodoQuery = "Status";
      break;
    case requestBody.category !== undefined:
      updateTodoQuery = "Category";
      break;
    case requestBody.priority !== undefined:
      updateTodoQuery = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateTodoQuery = "Todo";
      break;
    case requestBody.dueDate !== undefined:
      updateTodoQuery = "Due Date";
      break;
  }
  const getTodoQuery = `SELECT * FROM todo WHERE id='${todoId}';`;
  const currentTodoData = await db.get(getTodoQuery);
  const {
    category = currentTodoData.category,
    todo = currentTodoData.todo,
    priority = currentTodoData.priority,
    dueDate = currentTodoData.dueDate,
    status = currentTodoData.status,
  } = request.body;
  const updateNewTodoQuery = `UPDATE todo
  SET 
  todo = '${todo}',
  priority = '${priority}',
  status = '${status}',
  due_date = '${dueDate}'`;
  await db.run(updateNewTodoQuery);
  response.send(`${updateTodoQuery} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id='${todoId}'`;
  response.send("Todo Deleted");
});

module.exports = app;
