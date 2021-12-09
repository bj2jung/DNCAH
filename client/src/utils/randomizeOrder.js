export const randomizeOrder = (arr) => {
  return arr
    .map((obj) => ({
      ...obj,
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort);
};
