export type OpenApiText = {
  fr: string | null;
  en: string | null;
};

export interface DocTechnicalField {
  readonly description: OpenApiText | null;
  readonly notes?: OpenApiText | null;
  readonly examples?: ReadonlyArray<unknown>;
  readonly _?: Record<string, DocTechnicalField | DocBusinessField>;
}

export interface DocBusinessField extends DocTechnicalField {
  readonly metier: true;
  readonly section: OpenApiText;
  readonly information?: OpenApiText | null;
  readonly sample?: OpenApiText | null;
  readonly tags?: ReadonlyArray<string>;
  readonly tip?: null | {
    readonly title: OpenApiText;
    readonly content: OpenApiText;
  };
}

export type DataSource = {
  name: string;
  logo: { href: string };
  providers: string[];
  href: string;
};

export type DocModel = {
  readonly name: string;
  readonly description: string | null;
  readonly _: Record<string, DocBusinessField>;
  readonly sources: DataSource[];
};

export type DocRoute = {
  summary: { en: string; fr: string };
  description: { en: string; fr: string };
  parameters?: Record<string, DocTechnicalField>;
  response: {
    description: { en: string; fr: string };
    content?: DocTechnicalField;
  };
};
