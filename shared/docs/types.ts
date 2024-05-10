export type DocField = Readonly<{
  name: string;
  description: string;
  information: string;
  sample: string | null;
  tags: ReadonlyArray<string>;
  tip?: {
    title: string;
    content: string;
  };
}>;

export type DocTopologie = {
  name: string;
  fields: Record<string, DocField>;
};

export type DocDictionary = Record<string, DocTopologie>;
