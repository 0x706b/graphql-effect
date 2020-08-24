import { EvaluateConfig, OutputTypeConfig } from "../Config";
import {
   AnyField,
   AnyObjectType,
   AnyScalarType,
   FieldType,
   InputRecord,
   ObjectFieldType,
   RecursiveType,
   RecursiveTypeDef,
   ScalarFieldType
} from "../containers/index";
import { ResolverF } from "../Resolver";
import { TypeofInputRecord } from "../Utils";

export const GQLFieldAURI = "graphql-effect/algebras/GQLField" as const;
export type GQLFieldAURI = typeof GQLFieldAURI;

declare module "../HKT" {
   export interface AURItoFieldAlgebra<ApolloURI extends string, Root, Ctx> {
      [GQLFieldAURI]: GQLFieldAlgebra<ApolloURI, Root, Ctx>;
   }
}

export interface GQLFieldAlgebra<ApolloURI extends string, Root, Ctx> {
   boolean: <Config extends OutputTypeConfig>(
      config?: Config
   ) => ScalarFieldType<ApolloURI, Config, EvaluateConfig<Config, boolean>>;
   custom: <Type extends AnyScalarType<ApolloURI>, Config extends OutputTypeConfig>(
      type: () => Type,
      config?: Config
   ) => ScalarFieldType<ApolloURI, Config, EvaluateConfig<Config, Type["_A"]>>;
   field: <
      Type extends AnyField<ApolloURI, Ctx>,
      Args extends InputRecord<ApolloURI, Args>,
      S,
      R,
      E,
      A
   >(definiton: {
      args: Args;
      resolve: ResolverF<ApolloURI, Root, TypeofInputRecord<Args>, Ctx, S, R, E, Type["_A"]>;
      type: Type;
   }) => FieldType<
      ApolloURI,
      NonNullable<Type["config"]>,
      Type,
      Root,
      Args,
      Ctx,
      typeof definiton["resolve"],
      Type["_A"]
   >;
   float: <Config extends OutputTypeConfig>(
      config?: Config
   ) => ScalarFieldType<ApolloURI, Config, EvaluateConfig<Config, number>>;
   id: <Config extends OutputTypeConfig>(
      config?: Config
   ) => ScalarFieldType<ApolloURI, Config, EvaluateConfig<Config, number>>;
   int: <Config extends OutputTypeConfig>(
      config?: Config
   ) => ScalarFieldType<ApolloURI, Config, EvaluateConfig<Config, number>>;
   objectField: <Config extends OutputTypeConfig, Type extends AnyObjectType<ApolloURI, Ctx>>(
      type: () => Type,
      config?: Config
   ) => ObjectFieldType<
      ApolloURI,
      Config,
      Type["_ROOT"],
      Ctx,
      Type,
      EvaluateConfig<Config, EvaluateConfig<Config, Type["_A"]>>
   >;
   recursive: <Type extends RecursiveTypeDef<any, any>>() => <Config extends OutputTypeConfig>(
      name: Type["_NAME"],
      config?: Config
   ) => RecursiveType<ApolloURI, Config, Type, Type["_A"]>;
   string: <Config extends OutputTypeConfig>(
      config?: Config
   ) => ScalarFieldType<ApolloURI, Config, EvaluateConfig<Config, string>>;
}
