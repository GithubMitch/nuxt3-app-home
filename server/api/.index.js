const express = require('express')
const app = express()
const fs = require('fs');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser')
const config = require('../config.js');

const uuidv1 = require('uuid/v1');

const { body, check, validationResult } = require('express-validator');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


// create a new DynamoDB dynamodb
// which provides connectivity b/w the app
// and the db instance
AWS.config.update(config.aws_remote_config)

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'eu-central-1',
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com"
});

// const dynamodb = new AWS.DynamoDB.DocumentClient({
//     accesKeyId: "yijhhc",
//     secretAccesKey: "tehjxf",
//     region: 'local',
//     endpoint: "http://localhost:8000"
// });

// update the region to 
// where DynamoDB is hosted
// AWS.config.update({
//     accesKeyId: "yijhhc",
//     secretAccesKey: "tehjxf",
//     region: 'local',
//     endpoint: "http://localhost:8000"
// });
// Input object with Table specified
// Since we're using scan() method, no query
// is required for us


// // dynamodb.scan() returns all the documents
// // in the table. you can also use dynamodb.query()
// // in case of adding a condition for selection
// dynamodb.scan(params, (err, data, res) => {
//     if (err) {
//         console.log(err);
//     } else {
//         var items = [];

//         // the rows are present in the Items property
//         // of the data object returned in the callback
//         // extract the Name property from the rows and
//         // push them into a new array
//         for (var i in data.Items)
//             items.push(data.Items[i]['Name']);

//         // send the obtained rows onto the response
//         res.contentType = 'application/json';
//         res.send(items);
//     }
// });
app.post("/populateproducts", (req, res) => {

    // :024149627445:table/products
    // const tableName = 'products';
    // const params = {
    //     TableName: tableName
    // };

    console.log("Importing dummy_products into store_data_model > products. Please wait.");
    let dummy_products = JSON.parse(fs.readFileSync('dummy_products.json', 'utf8'));
    dummy_products.forEach(function(product) {
      console.log(product)
        let params = {
            TableName: "products",
            Item: {
                "key": product.key,
                "name": product.name,
                "brand": product.brand,
                "ean": product.ean,
                "value": product.value,
                "price": product.price,
                "actionLabel": product.actionLabel,
                "inStock": product.inStock
            }
        };
        dynamodb.put(params, function(err, data) {
           if (err) {
               console.error(err);
           } else {
            console.log("AWS-DynamoDB : table : products :");
            console.log("   PutItem succeeded:", product.name);
           }
        });
    });
});
app.post("/populatebrands", (req, res) => {

    console.log("Importing brands into store_data_model > brands. Please wait.");
    let dummy_brands = JSON.parse(fs.readFileSync('dummy_brands.json', 'utf8'));
    dummy_brands.forEach(function(brand) {
        console.log(brand)
        let params = {
                TableName: "brands",
                Item: {
                    "key": brand.key,
                    "name": brand.name
                }
            };
        dynamodb.put(params, function(err, data) {
            if (err) {
                console.error(err);
            } else {
                console.log("AWS-DynamoDB : table : brands :");
                console.log("   PutItem succeeded:", brand.name);
            }
        });
    });
}),

app.get("/products", (req, res) => {

    let tableName = 'products';
    let params = {
        TableName: tableName
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let items = [];
            for (let i in data.Items)
                items.push(data.Items[i]);
                
            console.log('AWS-DynamoDB : table : items: ', '\n' , items)
            res.contentType = 'application/json';
            res.send(items);
        }
    });
});
app.get("/brands", (req, res) => {

    let tableName = 'brands';
    let params = {
        TableName: tableName
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let items = [];
            for (let i in data.Items)
                items.push(data.Items[i]);

            console.log('AWS-DynamoDB : table : brands: ', '\n' , items)

            res.contentType = 'application/json';
            res.send(items);
        }
    });
});


const colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};

const errMsg = 'Há.... gayyyyy!';


app.get('/echo/:what', (req, res) => {
    console.log(req.params)
})

app.post('/validate',
    // check([body('test').exists().withMessage('This has ERROR in it ')]),
    body('username').exists().withMessage('Field does not exist').bail().isEmail().withMessage('Not a valid email'),
    body('password').exists().withMessage('Field does not exist').isLength({ min: 5 }).withMessage('This field needs to be at least 5 characters long'),
    // body('mobile').exists().isMobilePhone(),
    // body('fullname').exists(),
    // body('street').exists(),
    // body('postalcode').exists(),
    // body('town').exists(),
    // body('street2').exists(),
    // body('postalcode2').exists(),
    // body('city2').exists(),

    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('🔴 Status : 422', errors)
            return res.status(400).json({ status: '400' , errors: errors.array() });
        }else {
            console.log('🟢 Status : 200', errors)
            return res.status(200).json({ status: '200' , errors: 'no errors', form: 'validated'});
        }
    },
);
app.post('/formvalidate', [
    // check('test')
        // .exists().withMessage('This field does not exist').bail(),
    check('email')
        .exists().withMessage('This field does not exist').bail()
        .isAlphanumeric('nl-NL', {ignore: ".@!#$%&'*+-/=?^_`{|}~"}).withMessage('Has to contain only alphabetic characters').bail()
        .isLength({ min: 8 }).withMessage('This field needs to be at least 8 characters long').bail()
        .isEmail().withMessage('Is not a valid email'),
    check('mobile')
        .exists().withMessage('This field does not exist').bail()
        .isNumeric().withMessage('Has to contain only numeric characters').bail()
        .isLength({ min: 8 }).withMessage('This field needs to be at least 10 characters long').bail()
        .isMobilePhone(['nl-NL', 'nl-BE']).withMessage('Is not a correct mobile phone number'),
    check('fullname')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 5 }).withMessage('This field needs to be at least 5 characters long').bail()
        .isAlpha('nl-NL', {ignore: ' '}).withMessage('Has to contain only alphabetic characters'),
    check('street')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 5 }).withMessage('This field needs to be at least 5 characters long').bail()
        .isAlphanumeric('nl-NL', {ignore: ' '}).withMessage('Has to contain only alphabetic/numeric characters'),
    check('postalcode')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 7 }).withMessage('This field needs to be at least 7 characters long').bail()
        .isPostalCode('NL', {ignore: ' '}).withMessage('Is not a valid NL postal code'),
    check('city')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 3 }).withMessage('This field needs to be at least 3 characters long').bail()
        .isAlpha('nl-NL', {ignore: ' '}).withMessage('Has to contain only alphabetic characters'),
    check('street2')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 5 }).withMessage('This field needs to be at least 5 characters long').bail()
        .isAlphanumeric('nl-NL', {ignore: ' '}).withMessage('Has to contain only alphabetic/numeric characters'),
    check('postalcode2')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 6 }).withMessage('This field needs to be at least 6 characters long').bail()
        .isPostalCode('NL', {ignore: '  '}).withMessage('is not a valid NL postal code e.g. (1000AP)'),
    check('city2')
        .exists().withMessage('This field does not exist').bail()
        .isLength({ min: 3 }).withMessage('This field needs to be at least 3 characters long').bail()
        .isAlpha('nl-NL', {ignore: ' '}).withMessage('Has to contain only alphabetic characters'),
    ],
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        // console.log(errors)
        if (!errors.isEmpty()) {
            console.log('🔴 Status : 422', {errors: errors.array()})
            // return 
            return res.status(400).json({ errors: errors.array() });
        } else {
            console.log('🟢 Status : 200', { status: '200' , errors: 'no errors', form: 'validated'})
            return res.status(200).json({ status: '200' , errors: 'no errors', form: 'validated'});
            // return 
        }
    },
);
 
module.exports = {
   path: '/api',
   handler: app
}