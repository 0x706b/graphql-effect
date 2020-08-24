import { entries } from "@0x706b/convenience-ts/Record";
import { reduceWithIndex_ as reduceRecord } from "@effect-ts/core/Classic/Record";
import { UnionToIntersection } from "@effect-ts/core/Utils";
import {
   DocumentNode,
   FieldDefinitionNode,
   InputObjectTypeDefinitionNode,
   ObjectTypeDefinitionNode,
   ScalarTypeDefinitionNode
} from "graphql";
import { Any as _A } from "ts-toolbelt";

import { createDocumentNode, createSchemaDefinitionNode } from "./AST";
import {
   AnyExtendObjectType,
   AnyInputObjectType,
   AnyObjectType,
   AnyRootTypes,
   AnyScalarType,
   ExtendObjectType,
   FieldRecord,
   ObjectType,
   ScalarType
} from "./containers";

export type AllResolvers<
   ApolloURI extends string,
   Ctx,
   Types extends AnyRootTypes<ApolloURI, Ctx>[]
> = _A.Compute<
   UnionToIntersection<
      {
         [k in keyof Types]: Types[k] extends ObjectType<
            infer URI,
            infer Name,
            infer Root,
            Ctx,
            infer FieldResolvers,
            infer Res,
            infer R,
            infer A
         >
            ? ApolloURI extends URI
               ? {
                    [k in Name]: Res;
                 }
               : never
            : Types[k] extends ExtendObjectType<
                 infer URI,
                 infer Root,
                 Ctx,
                 infer Type,
                 infer Fields,
                 infer Res,
                 infer A
              >
            ? ApolloURI extends URI
               ? { [k in Type["name"]]: Res }
               : never
            : never;
      }[keyof Types & number]
   >
>;

export type AllScalarDefinitions<
   ApolloURI extends string,
   Types extends AnyRootTypes<ApolloURI, any>[]
> = _A.Compute<
   UnionToIntersection<
      {
         [k in keyof Types]: Types[k] extends ScalarType<
            infer URI,
            infer Name,
            infer Funcs,
            infer E,
            infer A
         >
            ? ApolloURI extends URI
               ? {
                    [k in Name]: {
                       functions: Funcs;
                       name: Name;
                    };
                 }
               : never
            : never;
      }[keyof Types & number]
   >
>;

export interface SchemaParts<
   ApolloURI extends string,
   Ctx,
   Types extends Array<AnyRootTypes<ApolloURI, Ctx>>
> {
   resolvers: AllResolvers<ApolloURI, Ctx, Types>;
   scalars: AllScalarDefinitions<ApolloURI, Types>;
   typeDefs: DocumentNode;
}

export interface SchemaGenerator<ApolloURI extends string, Ctx> {
   <
      Types extends [
         ObjectType<
            ApolloURI,
            "Query",
            {},
            Ctx,
            FieldRecord<ApolloURI, {}, Ctx, any>,
            any,
            any,
            any
         >,
         ...AnyRootTypes<ApolloURI, Ctx>[]
      ]
   >(
      ...types: [...Types]
   ): SchemaParts<ApolloURI, Ctx, Types>;
}

export const makeSchemaGenerator = <ApolloURI extends string, Ctx>(): SchemaGenerator<
   ApolloURI,
   Ctx
> => (...types) => {
   const objectTypes: Record<string, AnyObjectType<ApolloURI, Ctx>> = {};
   const extendTypes: Record<string, AnyExtendObjectType<ApolloURI, Ctx>> = {};
   const inputObjectTypes: Record<string, AnyInputObjectType<ApolloURI>> = {};
   const scalarTypes: Record<string, AnyScalarType<ApolloURI>> = {};
   for (const type of types) {
      switch (type._tag) {
         case "ExtendObjectType": {
            extendTypes[(type as AnyExtendObjectType<ApolloURI, Ctx>).type.name] = type as any;
            break;
         }
         case "ObjectType": {
            objectTypes[(type as AnyObjectType<ApolloURI, Ctx>).name] = type as any;
            break;
         }
         case "InputObjectType": {
            inputObjectTypes[(type as AnyInputObjectType<ApolloURI>).name] = type as any;
            break;
         }
         case "ScalarType": {
            scalarTypes[(type as AnyScalarType<ApolloURI>).name] = type as any;
         }
      }
   }
   const resolvers: any = {};
   for (const [k, v] of entries(objectTypes)) {
      resolvers[k] = v.fieldResolvers;
   }
   for (const [k, v] of entries(extendTypes)) {
      if (resolvers[k]) {
         resolvers[k] = { ...resolvers[k], ...v.fieldResolvers };
      } else {
         resolvers[k] = v.fieldResolvers;
      }
   }
   const scalars: any = {};
   for (const [k, v] of entries(scalarTypes)) {
      scalars[k] = {
         functions: v.functions,
         name: v.name
      };
   }
   const extendFieldASTs = reduceRecord(
      extendTypes,
      {} as Record<string, FieldDefinitionNode[]>,
      (k, acc, v) => ({
         ...acc,
         [k]: v.fields
      })
   );
   const extendObjectNames = reduceRecord(extendTypes, [] as string[], (k, acc, _v) => [...acc, k]);
   const objectASTs = reduceRecord(objectTypes, [] as ObjectTypeDefinitionNode[], (k, acc, v) => {
      return extendObjectNames.includes(k)
         ? [...acc, { ...v.node, fields: [...(v.node.fields || []), ...extendFieldASTs[k]] }]
         : [...acc, v.node];
   });
   const inputASTs = reduceRecord(
      inputObjectTypes,
      [] as InputObjectTypeDefinitionNode[],
      (k, acc, v) => [...acc, v.node]
   );
   const scalarASTs = reduceRecord(scalarTypes, [] as ScalarTypeDefinitionNode[], (k, acc, v) => [
      ...acc,
      v.node
   ]);
   const schemaDefinitionNode = createSchemaDefinitionNode({
      mutation: Object.keys(resolvers).includes("Mutation"),
      query: Object.keys(resolvers).includes("Query")
   });
   const typeDefs = createDocumentNode([
      ...objectASTs,
      ...inputASTs,
      ...scalarASTs,
      schemaDefinitionNode
   ]);
   return { resolvers, scalars, typeDefs };
};
