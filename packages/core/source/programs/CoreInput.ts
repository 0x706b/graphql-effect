import { GQLInputAURI } from "../algebras";
import { InferredInputAlgebra } from "../HKT";

export const CoreInputPURI = "graphql-effect/programs/CoreInput" as const;
export type CoreInputPURI = typeof CoreInputPURI;

export interface CoreInputAlgebra<ApolloURI extends string>
   extends InferredInputAlgebra<ApolloURI, CoreInputPURI> {}

declare module "../HKT" {
   export interface PURItoInputAlgebras {
      [CoreInputPURI]: GQLInputAURI;
   }
   export interface InputProgramAlgebra<ApolloURI> {
      [CoreInputPURI]: CoreInputAlgebra<ApolloURI>;
   }
}
