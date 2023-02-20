var db=require('../config/connection')
var collection = require('../config/collection')
const { response } = require('express')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')


module.exports={
    shipped:(orderId)=>{
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: { status: 'shipped' }
                })
                resolve()
        })

    },
    getProductAdminDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        deliveryDetails:1,
                        paymentMethod:1,
                        status:1,
                        date:1,
                        totalPrice:1,
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'prod'
                    }
                },
                {
                    $project: {
                        deliveryDetails:1,
                        paymentMethod:1,
                        status:1,
                        date:1,
                        totalPrice:1,
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$prod', 0] }
                    }
                }
            ]).toArray()
            // console.log('--------prooooooducts');

            // console.log(order);
            resolve(order)
        })
    },
    getOrderList: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                {
                    $project: {
                        paymentMethod: 1,
                        status: 1,
                        date: 1,
                        userId: 1,
                        totalPrice: 1,
                    }
                }
            ]).toArray()
            console.log(order);
            resolve(order)
        })
    },
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ username: adminData.username })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        loginErr = 'admin exist but wrong password'
                        console.log('admin exist but wrong password');
                        resolve({ status: false ,loginErr:loginErr})
                    }
                })
            } else {
                console.log('admin not exist');
                loginErr = 'admin not exist'

                resolve({ status: false ,loginErr:loginErr})
            }
        })
    },
    doAdminSignup: (admindata) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            try {
                admindata.password = await bcrypt.hash(admindata.password, 10)
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(admindata).then((data) => {
                    console.log(data);
                    response.admin =admindata
                    resolve(response)
                })
            } catch (err) {
                next(err)
            }
        })
    },
    addProduct:(product,callback)=>{
    db.get().collection('product').insertOne(product).then((data)=>{
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({
            _id: product._id, stock: { $type: 2 }
        },
            [{ $set: { stock: { $toInt: "$stock" } } }]
        )
        callback(data.insertedId)
    })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve, reject) => {
            let products =await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)
        })
    },
    
    getSameCategoryProducts:(cat)=>{
        return new Promise(async(resolve, reject) => {
            let products =await db.get().collection(collection.PRODUCT_COLLECTIONS).find({category:cat}).toArray()
            // console.log('IIIIIIIIIIIIIIIIII',products);
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve, reject) => {
            // console.log(objectId(proId));
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:objectId(proId) }).then((response)=>{
                // console.log(response);
                resolve(response)
            })
        })
    },
    getProdctDetails:(prodId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(prodId)}).then((product)=>{
                // console.log(product);
                
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(proId)},{
                $set:{
                    category:proDetails.category,
                    title:proDetails.title,
                    slug:proDetails.slug,
                    tag:proDetails.tag,
                    smalldescription:proDetails.smalldescription,
                    stock:parseInt(proDetails.stock),
                    sellprice:proDetails.sellprice,
                    available:proDetails.available,
                    trending:proDetails.trending,
                    metakey:proDetails.metakey,
                    description:proDetails.description,
                    price:proDetails.price,
                }
            }).then((response)=>{
                // console.log('stocksssss',)
                resolve()
            })
        })
    },


    addCategory:(category,callback)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
            console.log(data.insertedId.toString() )
            callback(data.insertedId)
        })
    },
    getAllCategories:()=>{
        return new Promise(async(resolve, reject) => {
            let cat =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(cat)
        })
    },
    deleteCategory:(categoryId)=>{
        return new Promise((resolve, reject) => {
            // console.log(objectId(proId));
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(categoryId) }).then((response)=>{
                // console.log(response);
                resolve(response)
            })
        })
    },
    getCategoryDetails:(prodId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(prodId)}).then((category)=>{
                // console.log(category);
                
                resolve(category)
            })
        })
    },
    updateCategory:(proId,proDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    category:proDetails.category,
                    availableStatus:proDetails.availableStatus,
                    description:proDetails.description,
                    price:proDetails.price,
                    metakey:proDetails.metakey,
                    trending:proDetails.trending,
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getAllCategory:()=>{
        // return new Promise((resolve, reject) => {
        //     db.get().collection(collection.CATEGORY_COLLECTION).
        // })
        return new Promise(async(resolve, reject) => {
            let allCategory = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                
                {
                    $project:{
                        category:1,
                       
                    }
                }
            ]).toArray()
            console.log("all category",allCategory);
            resolve(allCategory)
        })
    }
}