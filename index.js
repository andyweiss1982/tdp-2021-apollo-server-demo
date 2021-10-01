import { ApolloServer, gql } from "apollo-server";

let id = 0;
const tasks = [];

const typeDefs = gql`
  type Task {
    id: Int!
    description: String!
    completed: Boolean!
  }

  type Query {
    allTasks: [Task]!
    Task(id: Int!): Task
  }

  type Mutation {
    createTask(description: String!): Task!
    toggleTaskCompletion(id: Int!): Task
    deleteTask(id: Int!): Task
  }
`;

const resolvers = {
  Query: {
    allTasks: () => tasks,
    Task: (_parent, { id }, _context, _info) => {
      const task = tasks.find((t) => t.id === id);
      return task;
    },
  },
  Mutation: {
    createTask: (_parent, { description }, _context, _info) => {
      id += 1;
      const task = { id, description, completed: false };
      tasks.push(task);
      return task;
    },
    toggleTaskCompletion: (_parent, { id }, _context, _info) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.completed = !task.completed;
      }
      return task;
    },
    deleteTask: (_parent, { id }, _context, _info) => {
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex === -1) {
        return;
      }
      const task = tasks[taskIndex];
      tasks.splice(taskIndex, 1);
      return task;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
