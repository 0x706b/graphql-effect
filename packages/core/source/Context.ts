import type * as O from "@effect-ts/system/Option";

export const ContextURI = "graphql-ts/ContextURI";
export type ContextURI = typeof ContextURI;

export interface RequestContext<Req> {
   req: O.Option<Req>;
}

export interface Context<URI extends string, Ctx> {
   [ContextURI]: {
      [k in URI]: Ctx;
   };
}
