export interface DocTechnicalField {
  readonly description: string | null;
  readonly notes?: string | null;
  readonly examples?: ReadonlyArray<unknown>;
  readonly _?: Record<string, DocTechnicalField | DocBusinessField>;
}

export interface DocBusinessField extends DocTechnicalField {
  readonly metier: true;
  readonly section: string;
  readonly information?: string | null;
  readonly sample?: string | null;
  readonly tags?: ReadonlyArray<string>;
  readonly tip?: null | {
    readonly title: string;
    readonly content: string;
  };
}

export type DataSource = {
  name: string;
  logo: { href: string; width: number; height: number };
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
  summary: string;
  description: string;
  parameters?: Record<string, DocTechnicalField>;
  response: {
    description: string;
    content?: DocTechnicalField;
  };
};
