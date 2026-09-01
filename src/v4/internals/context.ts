export type Context = {
  /**
   * The current depth in a recursive structure.
   */
  depth: number

  /**
   * The current recursion depth for intersection handling.
   */
  recursionDepth?: number

  /**
   * Set of visited schemas to prevent circular recursion.
   */
  visitedSchemas?: Set<string>
}
