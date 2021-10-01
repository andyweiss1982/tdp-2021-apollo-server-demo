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
    user: String!
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
        allTasks: (_parent, _args, context) => {
            return tasks.filter((task) => task.user === context.user);
        },
        Task: (_parent, { id }, context) => {
            const task = tasks
                .filter((task) => task.user === context.user)
                .find((t) => t.id === id);
            return task ?? null;
        },
    },
    Mutation: {
        createTask: (_parent, { description }, context) => {
            id += 1;
            const task = { id, description, user: context.user, completed: false };
            tasks.push(task);
            return task;
        },
        toggleTaskCompletion: (_parent, { id }, context) => {
            const task = tasks
                .filter((task) => task.user === context.user)
                .find((t) => t.id === id);
            if (task) {
                task.completed = !task.completed;
            }
            return task ?? null;
        },
        deleteTask: (_parent, { id }, context) => {
            const taskIndex = tasks.findIndex((t) => t.id === id);
            if (taskIndex === -1) {
                return null;
            }
            const task = tasks[taskIndex];
            if (task.user !== context.user) {
                return null;
            }
            tasks.splice(taskIndex, 1);
            return task;
        },
    },
};
const server = new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        return { user: req.headers.authorization };
    },
});
// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
