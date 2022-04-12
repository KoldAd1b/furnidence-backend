const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mockProducts = require("./products");

const single_product_url = `https://course-api.com/react-store-single-product?id=`;

const products_url = "https://course-api.com/react-store-products";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const generateRandomRating = () => {
  const integer = getRandomInt(3, 5);
  const float = getRandomInt(0, 10);

  return Number(`${integer}.${float}`);
};

const modifyProducts = () => {
  let newProducts = [];
  for (const product of mockProducts) {
    product.averageRating = generateRandomRating();
    newProducts.push(product);
  }
  return newProducts;
};
const writeDataToFile = (data) => {
  fs.writeFile(
    path.join(__dirname, "products.json"),
    JSON.stringify(data),
    (err) => {
      if (err) throw err;
    }
  );
};
const readDataAndModify = () => {
  fs.readFile(path.join(__dirname, "products.json"), (err, data) => {
    if (err) {
      throw err;
    }
    const products = JSON.parse(data);

    let modifiedProducts = [];

    for (const product of products) {
      product.user = "620bc3a1bdd254635e5c660f";
      modifiedProducts.push(product);
    }
    writeDataToFile(modifiedProducts);
  });
};

readDataAndModify();

const getProducts = async () => {
  let newProducts = [];
  const response = await axios.get(products_url);

  for (const product of response.data) {
    const { id: _id } = product;

    const response = await axios.get(`${single_product_url}${_id}`);
    const fetchedProduct = response.data;
    const { stars, images } = fetchedProduct;

    product.averageRating = stars;
    product.images = images;

    delete product["id"];

    newProducts.push(product);
  }
  writeDataToFile(newProducts);
};
