export default [
  {
    method: 'GET',
    path: '/hello',
    handler: 'controller.hello',
    config: {
      auth: false, // true, если нужна авторизация
    },
  },
  {
    method: 'GET',
    path: '/tables',
    handler: 'controller.tables',
    config: {auth: false},
  },
  {
    method: 'POST',
    path: '/dump-collection',
    handler: 'controller.dumpCollection',
    config: {auth: false},
  },
  {
    method: 'POST',
    path: '/import-collection',
    handler: 'controller.importCollection',
    config: {auth: false},
  },
  {
    method: "GET",
    path: "/schema",
    handler: "controller.getSchema",
    config: {auth: false}
  },
];
