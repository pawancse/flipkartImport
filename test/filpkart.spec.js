describe('Flipkart API accumulation', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  var request = require('request');
  var fs = require('fs');
  var urls;
  var product = [];
  const MongoClient = require('mongodb').MongoClient;
  const MONGO_URL = 'mongodb://proxap:proxap123456@ds161042.mlab.com:61042/atlas';
  it('delete items from db', function (done) {
    return new Promise(function (resolve, reject) {
      return MongoClient.connect(MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        return db.collection('flipkartMobileProduct').remove({},
          function (err, res) {
            if (err) {
              db.close();
              return console.log(err);
            }
            else {
              console.log('All data from flipkartMobileProduct deleted Successfully');
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
  it('getAllProduct', function (done) {
    var url = 'https://affiliate-api.flipkart.net/affiliate/api/pawanbcet.json';
    return requestAPI(url)
      .then(function (response) {
        urls = response.apiGroups.affiliate.apiListings.mobiles.availableVariants['v1.1.0'].get;
      })
      .then(done)
      .catch(done);
  });

  /*   it('Offers Product for mobile', function (done) {
         return requestAPI('https://affiliate-api.flipkart.net/affiliate/offers/v1/all/json')
         .then(function (response) {
             addItemToProduct(response.products);
            // return callNextURL(response.nextUrl);
         })
         .then(done)
         .catch(done);
     });  
     */

  it('getAllProduct for mobile', function (done) {
    return requestAPI(urls)
      .then(function (response) {
        addItemToProduct(response.products);
        return callNextURL(response.nextUrl);
      })
      .then(done)
      .catch(done);
  });

  function addItemToProduct(productArray) {
    productArray = productArray.filter(function (item) {
      return item.productBaseInfoV1.inStock == true;
    });
    return new Promise(function (resolve, reject) {
      return MongoClient.connect(MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        return db.collection('flipkartMobileProduct').insert(
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
        return addItemToProduct(response.products);
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
      proxy: 'http://127.0.0.1:8888',
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
