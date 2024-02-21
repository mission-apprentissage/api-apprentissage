import { createStream, QualifiedAttribute } from "sax";
import { Readable, Transform } from "stream";

interface XmlJson {
  attributes: Record<string, string | QualifiedAttribute>;
  children: Record<string, XmlJson[]>;
  value?: string;
}

// Parses an XML file stream and transform it into a object stream with the given selector
// This function is useful to parse large XML files without loading the entire file into memory
export function parseXmlFileStream(input: Readable, selector: string): Readable {
  const saxStream = createStream(true, { trim: true });
  const outputStream = new Transform({ objectMode: true });

  const stack: XmlJson[] = [];

  const safeListener = <T>(listener: (v: T) => unknown) => {
    return (v: T): void => {
      try {
        listener(v);
      } catch (error) {
        outputStream.emit("error", error);
      }
    };
  };

  input.on("error", (error) => {
    outputStream.emit("error", error);
    outputStream.destroy();
  });

  saxStream.on("error", (error) => {
    outputStream.emit("error", error);
    outputStream.destroy();
  });

  saxStream.on(
    "opentag",
    safeListener(({ name, attributes }) => {
      const currentTag: XmlJson = { attributes, children: {} };

      if (stack.length === 0) {
        if (name !== selector) {
          return;
        }

        stack.push(currentTag);
        return;
      }

      const parentTag = stack[stack.length - 1];
      if (parentTag.children[name]) {
        parentTag.children[name].push(currentTag);
      } else {
        parentTag.children[name] = [currentTag];
      }
      stack.push(currentTag);
    })
  );
  saxStream.on(
    "closetag",
    safeListener(() => {
      const tag = stack.pop();
      if (tag && stack.length === 0) {
        outputStream.push(tag);
      }
    })
  );
  saxStream.on(
    "text",
    safeListener((tag) => {
      if (stack.length > 0) {
        stack[stack.length - 1].value = tag;
      }
    })
  );
  saxStream.on("end", () => {
    outputStream.push(null);
  });

  input.pipe(saxStream);

  return outputStream;
}
