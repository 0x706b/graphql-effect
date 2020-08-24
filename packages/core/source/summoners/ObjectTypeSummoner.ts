import { reduceWithIndex_ as reduceRecord } from "@effect-ts/core/Classic/Record";
import { FieldDefinitionNode, ObjectTypeDefinitionNode } from "graphql";

import {
   addNameToUnnamedFieldDefinitionNode,
   createFieldDefinitionNode,
   createObjectTypeDefinitionNode
} from "../AST";
import { OutputTypeConfig } from "../Config";
import {
   AnyOutputFieldType,
   AnyOutputType,
   FieldRecord,
   FieldResolverRecord,
   ObjectType
} from "../containers";
import { FieldPURIS, InferredFieldAlgebra } from "../HKT";
import { FieldResolversEnv } from "../Resolver";
import { TypeofFieldRecord } from "../Utils";

export interface ObjectTypeSummoner<URI extends string, PURI extends FieldPURIS, Root, Ctx> {
   <Name extends string, Fields extends FieldRecord<URI, Root, Ctx, Fields>>(definition: {
      fields: (F: InferredFieldAlgebra<URI, PURI, Root, Ctx>) => Fields;
      name: Name;
   }): ObjectType<
      URI,
      Name,
      Root,
      Ctx,
      Fields,
      FieldResolverRecord<URI, Fields>,
      FieldResolversEnv<URI, FieldResolverRecord<URI, Fields>, Ctx>,
      TypeofFieldRecord<Fields>
   >;
}

function buildObjectType<URI extends string, PURI extends FieldPURIS>(
   definition: {
      config?: OutputTypeConfig;
      fields: (F: InferredFieldAlgebra<URI, PURI, any, any>) => FieldRecord<URI, any, any, any>;
      name: string;
   },
   interpreters: InferredFieldAlgebra<URI, PURI, any, any>
): ObjectTypeDefinitionNode {
   return createObjectTypeDefinitionNode({
      fields: reduceRecord(
         definition.fields(interpreters) as any,
         [] as FieldDefinitionNode[],
         (k, acc, v: NonNullable<AnyOutputFieldType<URI, any>>) => {
            switch (v._tag) {
               case "RecursiveType":
                  return [
                     ...acc,
                     createFieldDefinitionNode({
                        description: v.config?.description,
                        list: v.config?.list,
                        name: k,
                        nonNullable: v.config?.nullable ? false : true,
                        typeName: v.name
                     })
                  ];
               case "FieldType":
                  return [...acc, addNameToUnnamedFieldDefinitionNode(v.node, k)];
               case "ScalarFieldType":
                  return [...acc, addNameToUnnamedFieldDefinitionNode(v.node, k)];
               case "ObjectFieldType":
                  return [...acc, addNameToUnnamedFieldDefinitionNode(v.node, k)];
            }
         }
      ),
      name: definition.name
   });
}

export function makeObjectTypeSummoner<URI extends string, PURI extends FieldPURIS>() {
   return (interpreters: InferredFieldAlgebra<URI, PURI, any, any>) => <
      Root = {},
      Ctx = {}
   >(): ObjectTypeSummoner<URI, PURI, Root, Ctx> => (definition) => {
      const fields = definition.fields(interpreters);
      return new ObjectType(
         definition.name,
         buildObjectType(definition, interpreters),
         fields,
         reduceRecord(fields, {}, (k, acc, v: AnyOutputType<URI, Ctx>) => {
            if (v._tag === "FieldType") {
               return { ...acc, [k]: v.resolve };
            }
            return acc;
         }) as any
      );
   };
}
