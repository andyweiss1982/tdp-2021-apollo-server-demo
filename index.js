"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
let id = 0;
const tasks = [];
const typeDefs = (0, apollo_server_1.gql) `
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
        Task: (_parent, { id }) => {
            const task = tasks.find((t) => t.id === id);
            return task;
        },
    },
    Mutation: {
        createTask: (_parent, { description }) => {
            id += 1;
            const task = { id, description, completed: false };
            tasks.push(task);
            return task;
        },
        toggleTaskCompletion: (_parent, { id }) => {
            const task = tasks.find((t) => t.id === id);
            if (task) {
                task.completed = !task.completed;
            }
            return task;
        },
        deleteTask: (_parent, { id }) => {
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
const server = new apollo_server_1.ApolloServer({ typeDefs, resolvers });
// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
