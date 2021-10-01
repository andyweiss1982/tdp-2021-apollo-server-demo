import { ApolloServer, gql } from "apollo-server";
import {
  Maybe,
  Task,
  QueryTaskArgs,
  MutationCreateTaskArgs,
  MutationToggleTaskCompletionArgs,
  MutationDeleteTaskArgs,
} from "./generated/graphql";

type AuthContext = {
  user: string;
};

let id = 0;
const tasks: Task[] = [];

const typeDefs = gql`
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
    allTasks: (
      _parent: Record<string, never>,
      _args: Record<string, never>,
      context: AuthContext
    ): Task[] => {
      return tasks.filter((task) => task.user === context.user);
    },
    Task: (
      _parent: Record<string, never>,
      { id }: QueryTaskArgs,
      context: AuthContext
    ): Maybe<Task> => {
      const task = tasks
        .filter((task) => task.user === context.user)
        .find((t) => t.id === id);
      return task ?? null;
    },
  },
  Mutation: {
    createTask: (
      _parent: Record<string, never>,
      { description }: MutationCreateTaskArgs,
      context: AuthContext
    ): Task => {
      id += 1;
      const task = { id, description, user: context.user, completed: false };
      tasks.push(task);
      return task;
    },
    toggleTaskCompletion: (
      _parent: Record<string, never>,
      { id }: MutationToggleTaskCompletionArgs,
      context: AuthContext
    ): Maybe<Task> => {
      const task = tasks
        .filter((task) => task.user === context.user)
        .find((t) => t.id === id);
      if (task) {
        task.completed = !task.completed;
      }
      return task ?? null;
    },
    deleteTask: (
      _parent: Record<string, never>,
      { id }: MutationDeleteTaskArgs,
      context: AuthContext
    ): Maybe<Task> => {
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

const server = new ApolloServer({
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
