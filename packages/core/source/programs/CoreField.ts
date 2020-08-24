import { GQLFieldAURI, GQLInputAURI } from "../algebras";
import { InferredFieldAlgebra } from "../HKT";

export const CoreFieldPURI = "graphql-effect/programs/CoreField" as const;
export type CoreFieldPURI = typeof CoreFieldPURI;

export interface CoreFieldAlgebra<URI extends string, Root, Ctx>
   extends InferredFieldAlgebra<URI, CoreFieldPURI, Root, Ctx> {}

declare module "../HKT" {
   export interface PURItoFieldAlgebras {
      [CoreFieldPURI]: GQLFieldAURI | GQLInputAURI;
   }
   export interface FieldProgramAlgebra<ApolloURI, Root, Ctx> {
      [CoreFieldPURI]: CoreFieldAlgebra<ApolloURI, Root, Ctx>;
   }
}
