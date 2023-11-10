const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found with this id' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const [affectedRows] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (affectedRows > 0 && req.body.tagIds && req.body.tagIds.length) {
      const productTagsToRemove = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const productTagIds = productTagsToRemove.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove.map(({ id }) => id) } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found with this id' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
