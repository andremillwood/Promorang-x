import { createTRPCRouter } from "./create-context";
import { 
  hiProcedure, 
  createPostProcedure, 
  createTaskProcedure, 
  createCampaignProcedure,
  getContentSharesProcedure,
  buySharesProcedure,
  sellSharesProcedure,
  claimDividendsProcedure
} from "./routes/example/hi/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  posts: createTRPCRouter({
    create: createPostProcedure,
  }),
  tasks: createTRPCRouter({
    create: createTaskProcedure,
  }),
  campaigns: createTRPCRouter({
    create: createCampaignProcedure,
  }),
  contentShares: createTRPCRouter({
    getAll: getContentSharesProcedure,
    buy: buySharesProcedure,
    sell: sellSharesProcedure,
    claimDividends: claimDividendsProcedure,
  }),
});

export type AppRouter = typeof appRouter;