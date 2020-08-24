import { UnionToIntersection } from "@effect-ts/core/Utils";

export interface AURItoInputAlgebra<ApolloURI extends string> {}

export type InputAURIS = keyof AURItoInputAlgebra<any>;

export interface AURItoFieldAlgebra<ApolloURI extends string, Root, Ctx> {}

export type FieldAURIS = keyof AURItoFieldAlgebra<any, any, any>;

export type FieldAlgebra<
   ApolloURI extends string,
   AURI extends FieldAURIS,
   Root,
   Ctx
> = UnionToIntersection<AURItoFieldAlgebra<ApolloURI, Root, Ctx>[AURI]>;

export type InputAlgebra<ApolloURI extends string, AURI extends InputAURIS> = UnionToIntersection<
   AURItoInputAlgebra<ApolloURI>[AURI]
>;

export type FieldPURIS = keyof PURItoFieldAlgebras;

export type InputPURIS = keyof PURItoInputAlgebras;

export interface InputProgramAlgebra<ApolloURI extends string> {}

export interface FieldProgramAlgebra<ApolloURI extends string, Root, Ctx> {}

export interface PURItoInputAlgebras {}

export interface PURItoFieldAlgebras {}

export type InferredInputAlgebra<ApolloURI extends string, PURI extends InputPURIS> = InputAlgebra<
   ApolloURI,
   PURItoInputAlgebras[PURI]
>;

export type InferredFieldAlgebra<
   ApolloURI extends string,
   PURI extends FieldPURIS,
   Root,
   Ctx
> = FieldAlgebra<ApolloURI, PURItoFieldAlgebras[PURI], Root, Ctx>;
