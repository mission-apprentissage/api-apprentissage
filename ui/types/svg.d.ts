declare module "*.svg" {
  /** Turbopack expose un import `.svg` comme l'URL de l'asset, sans objet `{ src, width, height }`. */
  const url: string

  export default url
}
