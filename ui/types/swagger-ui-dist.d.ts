// Import profond du bundle utilisé par la page documentation-technique/try, cf. TryPage.
declare module "swagger-ui-dist/swagger-ui-bundle.js" {
  import type { SwaggerUIBundle } from "swagger-ui-dist"

  const bundle: SwaggerUIBundle

  export default bundle
}
