const storageSchema = {
  session: {
    location: {
      address: null,
      coordinates: [],
    },
    exobiology: {
      samples: {},
      signals: {},
      genuses: {},
    },
  },
  app: {},
  logs: {
    last: null,
    files: [],
  },
  cargo: {
    capacity: 0,
    inventory: [],
  },
};
module.exports = {
  schema: storageSchema,
};
