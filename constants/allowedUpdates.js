const productAllowedUpdates = {
  category: true,
  title: true,
  price: true,
  image: true,
  description: true,
  rating: { rate: true, count: true },
};

module.exports = { productAllowedUpdates };
