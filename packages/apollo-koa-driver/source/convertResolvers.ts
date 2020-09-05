import * as Tx from "@0x706b/convenience-ts/effect-ts/Effect";
import { entries } from "@0x706b/convenience-ts/Record";
import * as T from "@effect-ts/core/Effect";
import { pipe } from "@effect-ts/core/Function";
import * as O from "@effect-ts/system/Option";
import { ContextURI, SchemaResolvers, SchemaResolversEnv } from "@graphql-effect/core";
import type { Context } from "koa";

import { ApolloExpressSubsriptionsEnv, ApolloKoaConfig } from "./driver";

export function convertResolvers<
   ServerURI extends string,
   Conf extends ApolloKoaConfig,
   Ctx,
   RE,
   R extends SchemaResolvers<ServerURI, any, Ctx, R, any>
>(_: {
   env: SchemaResolversEnv<ServerURI, R, Ctx> & ApolloExpressSubsriptionsEnv<Conf> & RE;
   res: R;
   uri: ServerURI;
}) {
   const toBind = {};
   for (const [typeName, fields] of entries(_.res)) {
      const resolvers = {};
      for (const [fieldName, resolver] of entries(fields)) {
         if (typeof resolver === "function") {
            (resolvers as any)[fieldName] = (root: any, args: any, ctx: Context) =>
               pipe(
                  (resolver as any)({
                     args: args || {},
                     ctx,
                     root: O.fromNullable(root)
                  }),
                  T.provide({
                     ...(_.env as any),
                     [ContextURI]: { [_.uri]: ctx }
                  }),
                  Tx.runPromiseSerializable
               );
         } else {
            (resolvers as any)[fieldName] = {
               subscribe: (root: any, args: any, ctx: Context) =>
                  pipe(
                     (resolver as any).subscribe({
                        args: args || {},
                        ctx,
                        root: O.fromNullable(root)
                     }),
                     T.provide({
                        ...(_.env as any),
                        [ContextURI]: { [_.uri]: ctx }
                     }),
                     Tx.runPromiseSerializable
                  )
            };

            if ((resolver as any).resolve) {
               (resolvers as any)[fieldName].resolve = (x: any, _: any, ctx: Context) =>
                  pipe(
                     (resolver as any).resolve({ ctx, sub: x }),
                     T.provide({
                        ...(_.env as any),
                        [ContextURI]: { [_.uri]: ctx }
                     }),
                     Tx.runPromiseSerializable
                  );
            }
         }
      }
      (toBind as any)[typeName] = resolvers;
   }
   return toBind;
}
