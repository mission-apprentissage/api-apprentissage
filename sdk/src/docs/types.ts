export type OpenApiText = {
  fr: string | null;
  en: string | null;
};

export interface DocTechnicalField {
  descriptions: OpenApiText[] | null;
  examples?: ReadonlyArray<unknown>;
  allOf?: DocTechnicalField[];
  oneOf?: DocTechnicalField[];
  anyOf?: DocTechnicalField[];
  not?: DocTechnicalField;
  items?: DocTechnicalField;
  properties?: Record<string, DocTechnicalField>;
  additionalProperties?: DocTechnicalField;
  propertyNames?: DocTechnicalField;
  prefixItems?: DocTechnicalField[];
}

export type DataSource = {
  name: string;
  logo: { href: string };
  providers: string[];
  href: string;
};

export type DocModelRow = {
  readonly description: OpenApiText | null;
  readonly notes?: OpenApiText | null;
  readonly examples?: ReadonlyArray<unknown>;
  readonly information?: OpenApiText | null;
  readonly sample?: OpenApiText | null;
  readonly tags?: ReadonlyArray<string>;
  readonly tip?: null | {
    readonly title: OpenApiText;
    readonly content: OpenApiText;
  };
};

export type DocModelSection = {
  name: OpenApiText;
  rows: Record<string, DocModelRow>;
};

export type DocDatum = {
  readonly name: OpenApiText;
  readonly sections: Record<string, DocModelSection>;
};

export type DocPage = {
  description: OpenApiText[];
  emailDemandeHabilitations: null | {
    subject: OpenApiText;
    body: OpenApiText;
  };
  frequenceMiseAJour: "daily" | null;
  type: "data" | "outil";
  sources: DataSource[];
  data: DocDatum[];
};

export type DocRoute = {
  summary: { en: string; fr: string };
  description: { en: string; fr: string };
  parameters?: Record<string, DocTechnicalField>;
  body?: {
    description: { en: string; fr: string } | null;
    content?: DocTechnicalField;
  };
  response: {
    description: { en: string; fr: string };
    content?: DocTechnicalField;
  };
};
