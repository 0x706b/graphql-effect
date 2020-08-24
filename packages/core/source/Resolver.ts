import type * as T from "@effect-ts/core/Effect";
import type * as U from "@effect-ts/core/Utils";
import type * as O from "@effect-ts/system/Option";

import { Context } from "./Context";

export interface ResolverInput<Root, Args, Ctx> {
   args: Args;
   ctx: Ctx;
   root: O.Option<Root>;
}

export interface SubscriptionResolverInput<Root, Ctx> {
   ctx: Ctx;
   result: Root;
}

export type ResolverF<URI extends string, Root, Args, Ctx, S, R, E, A> = (
   _: ResolverInput<Root, Args, Ctx>
) => T.Effect<S, R & Context<URI, Ctx>, E, A>;

export interface SubscriptionResolverF<
   URI extends string,
   Root,
   Args,
   Ctx,
   SS,
   SR,
   SE,
   SA,
   RS,
   RR,
   RE,
   RA
> {
   resolve?: (
      _: SubscriptionResolverInput<SA, Ctx>
   ) => T.Effect<RS, RR & Context<URI, Ctx>, RE, RA>;
   subscribe: (
      _: ResolverInput<Root, Args, Ctx>
   ) => T.Effect<SS, SR & Context<URI, Ctx>, SE, AsyncIterable<SA>>;
}

export type FieldResolvers<URI extends string, Args, Ctx, K> = {
   [k in keyof K]:
      | ResolverF<URI, any, Args, Ctx, any, any, any, any>
      | SubscriptionResolverF<URI, any, Args, Ctx, any, any, any, any, any, any, any, any>;
};

export type SchemaResolvers<URI extends string, Args, Ctx, N, K> = {
   [k in keyof N]: FieldResolvers<URI, Args, Ctx, K>;
};

export type SchemaResolversEnv<URI extends string, Res, Ctx> = Res extends SchemaResolvers<
   URI,
   any,
   Ctx,
   any,
   any
>
   ? FieldResolversEnv<URI, U.UnionToIntersection<Res[keyof Res]>, Ctx>
   : never;

export type FieldResolversEnv<URI extends string, Res, Ctx> = Res extends FieldResolvers<
   URI,
   any,
   Ctx,
   any
>
   ? U.UnionToIntersection<
        {
           [k in keyof Res]: Res[k] extends ResolverF<URI, any, any, Ctx, any, infer R, any, any>
              ? unknown extends R
                 ? never
                 : R
              : Res[k] extends SubscriptionResolverF<
                   URI,
                   any,
                   any,
                   Ctx,
                   any,
                   infer RS,
                   any,
                   any,
                   any,
                   infer RR,
                   any,
                   any
                >
              ? unknown extends RS
                 ? unknown extends RR
                    ? never
                    : RR
                 : unknown extends RR
                 ? RS
                 : RS & RR
              : never;
        }[keyof Res]
     >
   : never;

export type AofResolver<Res> = Res extends ResolverF<any, any, any, any, any, any, any, infer A>
   ? A
   : never;

export type EofResolver<Res> = Res extends ResolverF<any, any, any, any, any, any, infer E, any>
   ? E
   : never;

export type RofResolver<Res> = Res extends ResolverF<any, any, any, any, any, infer R, any, any>
   ? R
   : never;

export type SofResolver<Res> = Res extends ResolverF<any, any, any, any, infer S, any, any, any>
   ? S
   : never;
