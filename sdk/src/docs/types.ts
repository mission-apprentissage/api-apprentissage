export interface DocTechnicalField {
  type: "technical";
  name: string;
  description: string | null;
  notes: string | null;
}

export interface DocBusinessField extends Omit<DocTechnicalField, "type" | "description"> {
  type: "business";
  description: string;
  information: string | null;
  sample: string | null;
  tags: ReadonlyArray<string>;
  tip: null | {
    title: string;
    content: string;
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
