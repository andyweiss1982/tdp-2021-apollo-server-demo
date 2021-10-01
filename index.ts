import { ApolloServer, gql } from "apollo-server";
import {
  Maybe,
  Task,
  QueryTaskArgs,
  MutationCreateTaskArgs,
  MutationToggleTaskCompletionArgs,
  MutationDeleteTaskArgs,
} from "./generated/graphql";

let id = 0;
const tasks: Task[] = [];

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
    allTasks: (): Task[] => tasks,
    Task: (
      _parent: Record<string, never>,
      { id }: QueryTaskArgs
    ): Maybe<Task> => {
      const task = tasks.find((t) => t.id === id);
      return task ?? null;
    },
  },
  Mutation: {
    createTask: (
      _parent: Record<string, never>,
      { description }: MutationCreateTaskArgs
    ): Task => {
      id += 1;
      const task = { id, description, completed: false };
      tasks.push(task);
      return task;
    },
    toggleTaskCompletion: (
      _parent: Record<string, never>,
      { id }: MutationToggleTaskCompletionArgs
    ): Maybe<Task> => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.completed = !task.completed;
      }
      return task ?? null;
    },
    deleteTask: (
      _parent: Record<string, never>,
      { id }: MutationDeleteTaskArgs
    ): Maybe<Task> => {
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex === -1) {
        return null;
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
