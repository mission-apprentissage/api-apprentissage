export type DocField = Readonly<{
  name: string;
  description: string;
  information: string;
  sample: string | null;
  tags: ReadonlyArray<string>;
}>;

export type DocTopologie = {
  name: string;
  fields: Record<string, DocField>;
};

export type DocDictionary = Record<string, DocTopologie>;
