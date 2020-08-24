import type { SerializableError } from "@0x706b/convenience-ts/Error";
import type * as T from "@effect-ts/core/Effect";
import { FunctionN } from "@effect-ts/core/Function";
import type * as U from "@effect-ts/core/Utils";
import type { ValueNode } from "graphql";
import { Any as _Any } from "ts-toolbelt";

export type ScalarSerializeF<R, A> = (
   u: unknown
) => T.Effect<unknown, R, SerializableError<any>, A>;
export type ScalarParseValueF<R, E> = (
   u: unknown
) => T.Effect<unknown, R, SerializableError<any>, E>;
export type ScalarParseLiteralF<R, E> = (
   valueNode: ValueNode
) => T.Effect<never, R, SerializableError<any>, E>;

export interface ScalarFunctions<E, A> {
   parseLiteral: ScalarParseLiteralF<any, E>;
   parseValue: ScalarParseValueF<any, E>;
   serialize: ScalarSerializeF<any, A>;
}

export type Scalar<Name, E, A> = {
   functions: ScalarFunctions<E, A>;
   name: Name;
};

export type ScalarE<Fs> = Fs extends ScalarFunctions<infer E, any> ? E : never;
export type ScalarA<Fs> = Fs extends ScalarFunctions<any, infer A> ? A : never;

export type ScalarEnv<S> = _Any.Compute<
   S extends Scalar<any, any, any>
      ? U.UnionToIntersection<
           {
              [k in keyof S["functions"]]: S["functions"][k] extends FunctionN<any, infer Ret>
                 ? Ret extends T.Effect<infer _S, infer R, infer _E, infer _A>
                    ? unknown extends R
                       ? never
                       : R
                    : never
                 : never;
           }[keyof S["functions"]]
        >
      : never,
   "flat"
>;

export type SchemaScalars = {
   [n: string]: Scalar<any, any, any>;
};

export type SchemaScalarsEnv<S> = S extends SchemaScalars
   ? U.UnionToIntersection<
        {
           [k in keyof S]: ScalarEnv<S[k]>;
        }[keyof S]
     >
   : never;
