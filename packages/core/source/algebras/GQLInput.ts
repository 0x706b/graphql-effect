import { EvaluateConfig, InputTypeConfig } from "../Config";
import {
   AnyInputObjectType,
   AnyScalarType,
   InputObjectValueType,
   InputValueType
} from "../containers";

export const GQLInputAURI = "graphql-effect/algebras/GQLInput" as const;
export type GQLInputAURI = typeof GQLInputAURI;

declare module "../HKT" {
   export interface AURItoInputAlgebra<ApolloURI> {
      [GQLInputAURI]: GQLInputAlgebra<ApolloURI>;
   }
   export interface AURItoFieldAlgebra<ApolloURI, Root, Ctx> {
      [GQLInputAURI]: GQLInputAlgebra<ApolloURI>;
   }
}

export interface GQLInputAlgebra<ApolloURI extends string> {
   booleanArg: <Config extends InputTypeConfig<EvaluateConfig<Config, boolean>>>(
      config?: Config
   ) => InputValueType<ApolloURI, Config, EvaluateConfig<Config, boolean>>;
   customArg: <
      Type extends AnyScalarType<ApolloURI>,
      Config extends InputTypeConfig<EvaluateConfig<Config, Type["_A"]>>
   >(
      type: () => Type,
      config?: Config
   ) => InputValueType<ApolloURI, Config, EvaluateConfig<Config, Type["_A"]>>;
   floatArg: <Config extends InputTypeConfig<EvaluateConfig<Config, number>>>(
      config?: Config
   ) => InputValueType<ApolloURI, Config, EvaluateConfig<Config, number>>;
   idArg: <Config extends InputTypeConfig<EvaluateConfig<Config, string>>>(
      config?: Config
   ) => InputValueType<ApolloURI, Config, EvaluateConfig<Config, string>>;
   intArg: <Config extends InputTypeConfig<EvaluateConfig<Config, number>>>(
      config?: Config
   ) => InputValueType<ApolloURI, Config, EvaluateConfig<Config, number>>;
   objectArg: <
      Config extends InputTypeConfig<EvaluateConfig<Config, Type["_A"]>>,
      Type extends AnyInputObjectType<ApolloURI>
   >(
      type: () => Type,
      config?: Config
   ) => InputObjectValueType<ApolloURI, Config, Type, EvaluateConfig<Config, Type["_A"]>>;
   stringArg: <Config extends InputTypeConfig<EvaluateConfig<Config, string>>>(
      config?: Config
   ) => InputValueType<ApolloURI, Config, EvaluateConfig<Config, string>>;
}
