/**
 * Make same property optional on type
 *
 * @example
 * ```typescript
 * type post{
 *  id: string
 *  name: string
 *  email: string
 * }
 *
 * Optional<Post, 'id' | 'email'>
 * ```
 */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
