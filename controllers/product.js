const Product = require('../models/Product');
const Category = require('../models/Category');

module.exports.addGet = (req, res) => {
    Category.find().then((categories) => {
        let error = '';
        if (req.query.error) {
            error = req.query.error; 
        }
        res.render('product/add', { 
            categories,
            error
        });
    }).catch(err => {
        if (err) {
            return console.log(err);
        }
    });
};

module.exports.addPost = (req, res) => {
    let name = req.body.name;
    let description = req.body.description;
    let image = req.file;

    if (name === '' || description === '' || !image) {
        res.redirect('add/?error=' + encodeURIComponent('Name, description and image are reqiured!'));
        return;
    }

    let productObj = req.body;

    productObj.image = '/' + req.file.path;
    productObj.creator = req.user.id;
    Product.create(productObj).then((product) => {
        Category.findById(product.category).then((category) => {
            category.products.push(product._id);
            category.save().then(() => {
                req.user.createdProducts.push(product._id);
                req.user.save().then(() => {
                    res.redirect('/?success=' + encodeURIComponent('Product was create successfully!'));
                });
            });
        }).catch(err => {
            return console.log(err);
        });
    }).catch(err => {
        return console.log(err);
    });
};

module.exports.editGet = (req, res) => {
    let id = req.params.id;

    Product.findById(id).then(product => {
        if (!product) {
            res.sendStatus(404);
            return;
        }
        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            Category.find().then((categories) => {
                res.render('product/edit', {
                    product: product,
                    categories: categories
                });
            }).catch(err => {
                if (err) {
                    return console.log(err);
                }
            });
        } else {
            return res.redirect(`/?error=${encodeURIComponent('Only Creator and Admin can edit this product!')}`);
        }
    });  
};

module.exports.editPost = (req, res) => {
    let id = req.params.id;
    let editedProduct = req.body;

    Product.findById(id).then((product) => {
        if (!product) {
            res.redirect(`/?error=${encodeURIComponent('error=Product was not found!')}`);
            return;
        }

        product.name = editedProduct.name;
        product.description = editedProduct.description;
        product.price = editedProduct.price;

        if (req.file) {
            product.image = '/' + req.file.path;
        }

        if (product.category.toString() !== editedProduct.category) {
            Category.findById(product.category).then((currentCategory) => {
                Category.findById(editedProduct.category).then((nextCategory) => {
                    let index = currentCategory.products.indexOf(product._id);
                    if (index >= 0) {
                        currentCategory.products.splice(index, 1);
                    }
                    currentCategory.save();

                    nextCategory.products.push(product._id);
                    nextCategory.save();

                    product.category = editedProduct.category;

                    product.save().then(() => {
                        res.redirect('/?success=' + encodeURIComponent('Product was edit successfully!'));
                    });
                });
            }).catch(err => {
                if (err) {
                    return console.log(err);
                }
            });
        } else {
            product.save().then(() => {
                res.redirect('/?success=' + encodeURIComponent('Product was edit successfully!'));
            });
        }
    });
};

module.exports.deleteGet = (req, res) => {
    let id = req.params.id;

    Product.findById(id).then(product => {
        if (!product) {
            res.sendStatus(404);
            return;
        }

        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            Category.find().then((categories) => {
                res.render('product/delete', {
                    product: product,
                    categories: categories
                });
            });
        } else {
            return res.redirect(`/?error=${encodeURIComponent('Only Creator and Admin can delete this product!')}`);
        }
    }).catch(err => {
        if (err) {
            return console.log(err);
        }
    });
};

module.exports.deletePost = (req, res) => {
    let id = req.params.id;

    Product.findById(id).then(product => {
        if (!product) {
            return res.sendStatus(404);
        }

        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            Product.findByIdAndRemove(id).then(() => {
                res.redirect('/?success=' + encodeURIComponent('Product was delete successfully!'));
            });
        }
    }).catch(err => {
        if (err) {
            return console.log(err);
        }
    });
};

