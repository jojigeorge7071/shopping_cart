const { response } = require('express');

var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

router.get('/shipped/:id', async (req, res) => {

      console.log('re=======================================',req.params);
      var response = await productHelpers.shipped(req.params.id)
      res.json({ shippedFlag:true})
    })

router.get('/viewAdminOrder/:orderId', async (req, res) => {
    let orderItems = await productHelpers.getProductAdminDetails(req.params.orderId)
    details=orderItems[0]
    res.render('admin/viewAdminOrder', {admin:true, orderItems,details})
  
  })

router.get('/orderAdmin', async (req, res) => { 
    let order = await productHelpers.getOrderList()
    res.render('admin/orderAdmin', { order ,admin:true})
  })
router.get('/adminSignup', (req, res) => {
    res.render('admin/adminSignup', { admin: true })
})
router.post('/adminSignup', (req, res) => {
    productHelpers.doAdminSignup(req.body).then((response) => {
        // console.log(response)
        console.log('----------------------')
        req.session.admin = response.admin
        req.session.adminloggedIn = true
        console.log('session', req.session)

        res.redirect('/admin')
    })
})
router.get('/adminLogout', (req, res) => {
    req.session.admin = null
    req.session.adminloggedIn = false
    res.redirect('/admin')
})

router.get('/adminLogin', (req, res) => {
    res.render('admin/adminLogin', { admin: true })
})

router.post('/adminLogin', (req, res) => {
    productHelpers.doAdminLogin(req.body).then(async(response) => {
        
        if (response.status) {
            req.session.admin = response.admin
            req.session.adminloggedIn = true
            console.log('session', req.session)
            res.redirect('/admin')
        } else {
            // req.session.loginErr = 'Username or Password is wrong'
            res.render('admin/adminLogin', { admin: true ,loginErr: response.loginErr})
        }
    })
})

router.get('/', async (req, res) => {
    let adminS = req.session.admin
    let products = await productHelpers.getAllProducts()
    let category = await productHelpers.getAllCategories()
    if (adminS) {
        res.render('admin/viewProducts', { adminS, products, category, admin: true })

    }else{
        res.render('admin/viewProducts', { products, category, admin: true })
    }
})
/* GET users listing. */
// router.get('/', function (req, res, next) {
//   productHelpers.getAllProducts().then((products)=>{
//     // console.log(products)
//     res.render('admin/viewProducts', { products, admin: true })
//   })
// })


router.get('/add-product', async (req, res) => {
    let allCategory = await productHelpers.getAllCategory()
    res.render('admin/add-product', { allCategory, admin: true })

})
router.post('/add-product', function (req, res, next) {
    // var e = document.getElementById("selectValue");
    // var value = e.value;
    // console.log(value);
    // console.log(req.files);
    productHelpers.addProduct(req.body, (id) => {
        let image = req.files.photo
        image.mv('./public/product-image/' + id + '.jpg', (err, done) => {
            if (!err) {
                res.render('admin/add-product', { admin: true })
            } else {
                console.log(err);
            }
        })
    })
})

router.get('/delete-product/:id', (req, res) => {
    let proId = req.params.id
    // console.log(proId);
    productHelpers.deleteProduct(proId).then((response) => {
        // console.log(response);
        res.redirect('/admin')
    })
})

router.get('/edit-product/:id', async (req, res) => {
    let allCategory = await productHelpers.getAllCategory()

    let product = await productHelpers.getProdctDetails(req.params.id)
    // console.log(product);
    res.render('admin/edit-product', { allCategory, adim: true, product })
})

router.post('/edit-product/:id', (req, res) => {
    let id = req.params.id
    productHelpers.updateProduct(req.params.id, req.body).then(() => {
        try {
            res.redirect('/admin')
            if (req.files.photo) {
                let image = req.files.photo
                image.mv('./public/product-image/' + id + '.jpg')

            }
        } catch (error) {

        }

    })
})

router.get('/add-category', function (req, res) {
    res.render('admin/add-category', { admin: true })

})
router.post('/add-category', function (req, res, next) {
    productHelpers.addCategory(req.body, (id) => {
        let image = req.files.photo
        image.mv('./public/category-image/' + id + '.jpg', (err, done) => {
            if (!err) {
                res.render('admin/add-category', { admin: true })
            } else {
                console.log(err);
            }
        })
    })
})
router.get('/delete-category/:id', (req, res) => {
    let proId = req.params.id
    // console.log('categoryId:',proId);
    productHelpers.deleteCategory(proId).then((response) => {
        // console.log(response);
        res.redirect('/admin')
    })
})
router.get('/edit-category/:id', async (req, res) => {
    let category = await productHelpers.getCategoryDetails(req.params.id)
    // console.log(category);
    res.render('admin/edit-category', { category, admin: true })
})
router.post('/edit-category/:id', async (req, res) => {
    let id = req.params.id
    await productHelpers.updateCategory(req.params.id, req.body)
    try {
        res.redirect('/admin')
        if (req.files.photo) {
            let image = req.files.photo
            image.mv('./public/category-image/' + id + '.jpg')
        }
    } catch (error) {

    }


})


module.exports = router;
