/**
 * Type-safe application routes.
 *
 * Every entry is a function returning a path string. Static routes take no
 * arguments; dynamic routes accept the required params and produce a URL
 * with the values interpolated. This way the compiler catches typos and
 * missing params — `routes.item({})` won't compile if `id` is required.
 *
 * @example
 * routes.home();               // '/'
 * routes.template();           // '/template'
 * routes.item({ id: '42' });   // '/items/42'
 */
const routes = {
  home: () => '/' as const,
  template: () => '/template' as const,
  // Example of a dynamic route (uncomment and adapt):
  // item: ({ id }: { id: string | number }) => `/items/${id}` as const,
} as const;

export default routes;
