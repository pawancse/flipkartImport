describe('Flipkart API accumulation', function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 9000000;
    var request = require('request');
    var fs = require('fs');
    var urls;
    var product = [];
    const MongoClient = require('mongodb').MongoClient;
    var collectionName = 'flipkartFashion';
    const MONGO_URL = 'mongodb://proxap:proxap123456@ds161042.mlab.com:61042/atlas';
    it('delete items from db', function (done) {
        return new Promise(function (resolve, reject) {
            return MongoClient.connect(MONGO_URL, (err, db) => {
                if (err) {
                    return console.log(err);
                }
                return db.collection('flipkartFashion').remove({},
                    function (err, res) {
                        if (err) {
                            db.close();
                            return console.log(err);
                        }
                        else {
                            console.log('All data from flipkartFashion deleted Successfully');
                        }
                        db.close();
                        resolve(res);
                    }
                )
            })
        })
            .then(done)
            .catch(done);
    });

    //womens_clothing

    it('getAllProduct womens_clothing', function (done) {
        product = [];
        var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.womens_clothing.availableVariants['v1.1.0'].get;
            })
            .then(done)
            .catch(done);
    });

    it('getAllProduct for womens_clothing', function (done) {
        var response;
        return requestAPI(urls)
            .then(function (res) {
                response = res;
                return addItemToProduct(response.products, collectionName);
            })
            .then(function (res) {
                return callNextURL(response.nextUrl);
            })
            .then(done)
            .catch(done);
    });

    //womens_footwear

    it('getAllProduct womens_footwear', function (done) {
        product = [];
        var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.womens_footwear.availableVariants['v1.1.0'].get;
            })
            .then(done)
            .catch(done);
    });

    it('getAllProduct for womens_footwear', function (done) {
        var response;
        return requestAPI(urls)
            .then(function (res) {
                response = res;
                return addItemToProduct(response.products, collectionName);
            })
            .then(function (res) {
                return callNextURL(response.nextUrl);
            })
            .then(done)
            .catch(done);
    });

    //mens_footwear

    it('getAllProduct mens_footwear', function (done) {
        product = [];
        var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.mens_footwear.availableVariants['v1.1.0'].get;
            })
            .then(done)
            .catch(done);
    });

    it('getAllProduct for mens_footwear', function (done) {
        var response;
        return requestAPI(urls)
            .then(function (res) {
                response = res;
                return addItemToProduct(response.products, collectionName);
            })
            .then(function (res) {
                return callNextURL(response.nextUrl);
            })
            .then(done)
            .catch(done);
    });

    //mens_clothing

    it('getAllProduct mens_clothing', function (done) {
        product = [];
        var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
        return requestAPI(url)
            .then(function (response) {
                urls = response.apiGroups.affiliate.apiListings.mens_clothing.availableVariants['v1.1.0'].get;
            })
            .then(done)
            .catch(done);
    });

    it('getAllProduct for mens_clothing', function (done) {
        var response;
        return requestAPI(urls)
            .then(function (res) {
                response = res;
                return addItemToProduct(response.products, collectionName);
            })
            .then(function (res) {
                return callNextURL(response.nextUrl);
            })
            .then(done)
            .catch(done);
    });

    function addItemToProduct(productArray, collection) {
        productArray = productArray.filter(function (item) {
            return item.productBaseInfoV1.inStock == true;
        });
        return new Promise(function (resolve, reject) {
            return MongoClient.connect(MONGO_URL, (err, db) => {
                if (err) {
                    return console.log(err);
                }
                return db.collection(collection).insert(
                    productArray,
                    function (err, res) {
                        if (err) {
                            db.close();
                            return console.log(err);
                        }
                        else {
                            console.log('Data Inserted Successfully');
                        }
                        // Success
                        db.close();
                        productArray=[];
                        resolve(res);
                    }
                )
            })
        })
    }

    function callNextURL(url) {
        var response;
        return requestAPI(url)
            .then(function (res) {
                response = res;
                console.log(response.products.length);
                return addItemToProduct(response.products, collectionName);
            })
            .then(function () {
                if (response.nextUrl == null || response.products.length < 500) {
                    return;
                }
                else {
                    return callNextURL(response.nextUrl);
                }
            })
            .catch(function () {
                return;
            })
    }


    function requestAPI(urlString) {
        var options = {
            baseUrl: urlString,
            uri: '',
            headers: {
                'Fk-Affiliate-Id': 'pawanbcet',
                'Fk-Affiliate-Token': '2b295c26a45a431ca310b0dcb32206f7'
            },
            method: 'GET',
            json: true,
            rejectUnauthorized: false
        };
        console.log(options.baseUrl);
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
                if (!error) {
                    resolve(response.body);
                }
                else {
                    console.log(error);
                }
            });
        })
    };
});
