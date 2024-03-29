import { reduceWithIndex_ as reduceRecord } from "@effect-ts/core/Classic/Record";
import { Lazy } from "@effect-ts/core/Function";
import {
   BooleanValueNode,
   DefinitionNode,
   DirectiveNode,
   DocumentNode,
   EnumValueNode,
   FieldDefinitionNode,
   FloatValueNode,
   InputObjectTypeDefinitionNode,
   InputValueDefinitionNode,
   IntValueNode,
   Kind,
   ListTypeNode,
   ListValueNode,
   Location,
   NamedTypeNode,
   NameNode,
   NonNullTypeNode,
   NullValueNode,
   ObjectFieldNode,
   ObjectTypeDefinitionNode,
   ObjectTypeExtensionNode,
   ObjectValueNode,
   OperationTypeDefinitionNode,
   ScalarTypeDefinitionNode,
   SchemaDefinitionNode,
   StringValueNode,
   TypeNode,
   ValueNode
} from "graphql";
import { inspect } from "util";

interface FieldDefinitionNodeArgs {
   arguments?: ReadonlyArray<InputValueDefinitionNode>;
   description?: string;
   directives?: ReadonlyArray<DirectiveNode>;
   list?: boolean | [boolean];
   name: string;
   nonNullable?: boolean;
   typeName: string;
}

interface InputObjectTypeDefinitionNodeArgs {
   description?: string;
   directives?: Array<DirectiveNode>;
   fields: Array<InputValueDefinitionNode>;
   name: string;
}

interface ObjectTypeDefinitionNodeArgs {
   description?: string;
   directives?: Array<DirectiveNode>;
   fields: Array<FieldDefinitionNode>;
   interfaces?: Array<string>;
   name: string;
}

interface InputValueDefinitionNodeArgs {
   defaultValue?: any;
   description?: string;
   directives?: Array<DirectiveNode>;
   list?: boolean | [boolean];
   name: string;
   nonNullable?: boolean;
   typeName: string;
}

interface TypeNodeArgs {
   list?: boolean | [boolean];
   nonNullable?: boolean;
   typeName: string;
}

interface ScalarTypeDefinitionNodeArgs {
   description?: string;
   directives?: Array<DirectiveNode>;
   name: string;
}

export interface UnnamedFieldDefinitionNode {
   readonly arguments?: ReadonlyArray<InputValueDefinitionNode>;
   readonly description?: StringValueNode;
   readonly directives?: ReadonlyArray<DirectiveNode>;
   readonly kind: "UnnamedFieldDefinition";
   readonly loc?: Location;
   readonly type: TypeNode;
}

export interface UnnamedInputValueDefinitionNode {
   readonly defaultValue?: ValueNode;
   readonly description?: StringValueNode;
   readonly directives?: ReadonlyArray<DirectiveNode>;
   readonly kind: "UnnamedInputValueDefinition";
   readonly loc?: Location;
   readonly type: TypeNode;
}

export function createNullValueNode(): NullValueNode {
   return {
      kind: Kind.NULL
   };
}

export function createIntValueNode(value: number): IntValueNode {
   return {
      kind: Kind.INT,
      value: value.toString()
   };
}

export function createFloatValueNode(value: number): FloatValueNode {
   return {
      kind: Kind.FLOAT,
      value: value.toString()
   };
}

export function createBooleanValueNode(value: boolean): BooleanValueNode {
   return {
      kind: Kind.BOOLEAN,
      value
   };
}

export function createEnumValueNode(value: string): EnumValueNode {
   return {
      kind: Kind.ENUM,
      value
   };
}

export function createListValueNode(values: Array<ValueNode>): ListValueNode {
   return {
      kind: Kind.LIST,
      values
   };
}

export function createObjectValueNode(fields: Array<ObjectFieldNode>): ObjectValueNode {
   return {
      fields,
      kind: Kind.OBJECT
   };
}

export function createNameNode(value: string): NameNode {
   return {
      kind: Kind.NAME,
      value
   };
}

export function createObjectFieldNode(name: string, value: ValueNode): ObjectFieldNode {
   return {
      kind: Kind.OBJECT_FIELD,
      name: createNameNode(name),
      value
   };
}

export function createStringValueNode(value: string, block: boolean): StringValueNode {
   return {
      block: block,
      kind: "StringValue",
      value
   };
}

export function createNonNullTypeNode(type: NamedTypeNode | ListTypeNode): NonNullTypeNode {
   return {
      kind: Kind.NON_NULL_TYPE,
      type
   };
}

export function createListTypeNode(type: TypeNode): ListTypeNode {
   return {
      kind: Kind.LIST_TYPE,
      type
   };
}

export function createNamedTypeNode(typeName: string): NamedTypeNode {
   return {
      kind: Kind.NAMED_TYPE,
      name: createNameNode(typeName)
   };
}

export function processListAndNonNullableArgs(args: {
   list?: boolean | [boolean];
   nonNullable?: boolean;
   typeNode: NamedTypeNode | ListTypeNode;
}): TypeNode {
   let type: TypeNode = Object.assign({}, args.typeNode);
   if (args.list) {
      if (Array.isArray(args.list)) {
         type = args.list[0]
            ? createListTypeNode(createNonNullTypeNode(type))
            : createListTypeNode(type);
      } else {
         type = args.list ? createListTypeNode(createNonNullTypeNode(type)) : type;
      }
   }
   if (args.nonNullable) {
      type = createNonNullTypeNode(type);
   }
   if (args.typeNode.kind === "NamedType" && args.typeNode.name.value === "Int") {
      console.log(inspect(type, false, 6, true));
   }
   return type;
}

export function createTypeNode(args: TypeNodeArgs): TypeNode {
   return processListAndNonNullableArgs({
      list: args.list,
      nonNullable: args.nonNullable,
      typeNode: createNamedTypeNode(args.typeName)
   });
}

export function createFieldDefinitionNode(args: FieldDefinitionNodeArgs): FieldDefinitionNode {
   return {
      arguments: args.arguments,
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      kind: "FieldDefinition",
      name: createNameNode(args.name),
      type: createTypeNode({
         list: args.list,
         nonNullable: args.nonNullable,
         typeName: args.typeName
      })
   };
}

export function createUnnamedFieldDefinitionNode(
   args: Omit<FieldDefinitionNodeArgs, "name">
): UnnamedFieldDefinitionNode {
   return {
      arguments: args.arguments,
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      kind: "UnnamedFieldDefinition",
      type: createTypeNode({
         list: args.list,
         nonNullable: args.nonNullable,
         typeName: args.typeName
      })
   };
}

export function createValueNode(value: any): ValueNode {
   switch (typeof value) {
      case "string":
         return createStringValueNode(value, false);
      case "boolean":
         return createBooleanValueNode(value);
      case "bigint":
         return createStringValueNode(value.toString(), false);
      case "number":
         return Number.isSafeInteger(value)
            ? createIntValueNode(value)
            : createFloatValueNode(value);
      case "undefined":
         return createNullValueNode();
      case "object": {
         if (Array.isArray(value)) {
            const valueNodes = value.map((v) => createValueNode(v));
            return createListValueNode(valueNodes);
         } else {
            const fieldNodes = reduceRecord(value, [] as ObjectFieldNode[], (k, acc, v) => [
               ...acc,
               createObjectFieldNode(k, createValueNode(v))
            ]);
            return createObjectValueNode(fieldNodes);
         }
      }
      default: {
         return createStringValueNode(String(value), false);
      }
   }
}

export function createInputValueDefinitionNode(
   args: InputValueDefinitionNodeArgs
): InputValueDefinitionNode {
   return {
      defaultValue: (args.defaultValue && createValueNode(args.defaultValue)) || undefined,
      directives: args.directives,
      kind: Kind.INPUT_VALUE_DEFINITION,
      name: createNameNode(args.name),
      type: createTypeNode({
         list: args.list,
         nonNullable: args.nonNullable,
         typeName: args.typeName
      })
   };
}

export function createObjectTypeDefinitionNode(
   args: ObjectTypeDefinitionNodeArgs
): ObjectTypeDefinitionNode {
   return {
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      fields: args.fields,
      interfaces: args.interfaces ? args.interfaces.map(createNamedTypeNode) : undefined,
      kind: Kind.OBJECT_TYPE_DEFINITION,
      name: createNameNode(args.name)
   };
}

export function createLazyObjectTypeDefinitionNode(
   args: ObjectTypeDefinitionNodeArgs
): Lazy<ObjectTypeDefinitionNode> {
   return () => ({
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      fields: args.fields,
      interfaces: args.interfaces ? args.interfaces.map(createNamedTypeNode) : undefined,
      kind: Kind.OBJECT_TYPE_DEFINITION,
      name: createNameNode(args.name)
   });
}

export function createUnnamedInputValueDefinitionNode(
   args: Omit<InputValueDefinitionNodeArgs, "name">
): UnnamedInputValueDefinitionNode {
   return {
      defaultValue: args.defaultValue ? createValueNode(args.defaultValue) : undefined,
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      kind: "UnnamedInputValueDefinition",
      type: createTypeNode({
         list: args.list,
         nonNullable: args.nonNullable,
         typeName: args.typeName
      })
   };
}

export function createInputObjectTypeDefinitionNode(
   args: InputObjectTypeDefinitionNodeArgs
): InputObjectTypeDefinitionNode {
   return {
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      fields: args.fields,
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: createNameNode(args.name)
   };
}

export function getTypeName(
   type:
      | UnnamedFieldDefinitionNode
      | ObjectTypeDefinitionNode
      | TypeNode
      | UnnamedInputValueDefinitionNode
      | InputObjectTypeDefinitionNode
): string {
   switch (type.kind) {
      case Kind.OBJECT_TYPE_DEFINITION:
         return type.name.value;
      case "UnnamedFieldDefinition":
         return getTypeName(type.type);
      case Kind.LIST_TYPE:
         return getTypeName(type.type);
      case Kind.NAMED_TYPE:
         return type.name.value;
      case Kind.NON_NULL_TYPE:
         return getTypeName(type.type);
      case "UnnamedInputValueDefinition":
         return getTypeName(type.type);
      case Kind.INPUT_OBJECT_TYPE_DEFINITION:
         return type.name.value;
   }
}

export function createObjectTypeExtensionNode(
   args: ObjectTypeDefinitionNodeArgs
): ObjectTypeExtensionNode {
   return {
      directives: args.directives,
      fields: args.fields,
      interfaces: args.interfaces ? args.interfaces.map(createNamedTypeNode) : undefined,
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name: createNameNode(args.name)
   };
}

interface SchemaDefinitionNodeArgs {
   description?: string;
   directives?: Array<DirectiveNode>;
   mutation?: boolean;
   query?: boolean;
   subscription?: boolean;
}

export function createOperationTypeDefinitionNode(
   name: "query" | "mutation" | "subscription"
): OperationTypeDefinitionNode {
   return {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation: name,
      type: (() => {
         switch (name) {
            case "query":
               return createNamedTypeNode("Query");
            case "mutation":
               return createNamedTypeNode("Mutation");
            case "subscription":
               return createNamedTypeNode("Subscription");
         }
      })()
   };
}

export function createSchemaDefinitionNode(args: SchemaDefinitionNodeArgs): SchemaDefinitionNode {
   return {
      description: args.description ? createStringValueNode(args.description, true) : undefined,
      directives: args.directives,
      kind: Kind.SCHEMA_DEFINITION,
      operationTypes: (() => {
         const ops: Array<OperationTypeDefinitionNode> = [];
         args.query && ops.push(createOperationTypeDefinitionNode("query"));
         args.mutation && ops.push(createOperationTypeDefinitionNode("mutation"));
         args.subscription && ops.push(createOperationTypeDefinitionNode("subscription"));
         return ops;
      })()
   };
}

export function createDocumentNode(definitions: ReadonlyArray<DefinitionNode>): DocumentNode {
   return {
      definitions: [...definitions],
      kind: Kind.DOCUMENT
   };
}

export const addNameToUnnamedFieldDefinitionNode = (
   node: UnnamedFieldDefinitionNode,
   name: string
): FieldDefinitionNode => ({
   ...node,
   kind: Kind.FIELD_DEFINITION,
   name: createNameNode(name)
});

export const createScalarTypeDefinitionNode = (
   args: ScalarTypeDefinitionNodeArgs
): ScalarTypeDefinitionNode => ({
   description: args.description ? createStringValueNode(args.description, true) : undefined,
   directives: args.directives ?? undefined,
   kind: Kind.SCALAR_TYPE_DEFINITION,
   name: createNameNode(args.name)
});
