export interface DocTechnicalField {
  readonly description: string | null;
  readonly notes?: string | null;
  readonly examples?: ReadonlyArray<unknown>;
  readonly _?: Record<string, DocTechnicalField>;
}

export interface DocBusinessField extends DocTechnicalField {
  readonly metier: true;
  readonly information?: string | null;
  readonly sample?: string | null;
  readonly tags?: ReadonlyArray<string>;
  readonly tip?: null | {
    readonly title: string;
    readonly content: string;
  };
}

export type DocBusinessSection = {
  name: string;
  fields: Record<string, DocBusinessField | DocTechnicalField>;
};

export type DataSource = {
  name: string;
  logo: { href: string; width: number; height: number };
  providers: string[];
  href: string;
};

export type DocModel = {
  name: string;
  sections: DocBusinessSection[];
  sources: DataSource[];
};

export type DocRoute = {
  summary: string;
  description: string;
  parameters?: Record<string, DocTechnicalField>;
  response: {
    description: string;
    _?: Record<string, DocTechnicalField>;
  };
};
