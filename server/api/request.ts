import type { IncomingMessage, ServerResponse } from 'http'
import config from '../../config.js';
import AWS from 'aws-sdk';
import ref from "vue";

AWS.config.update(config.aws_remote_config)

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'eu-central-1',
  endpoint: "https://dynamodb.eu-central-1.amazonaws.com"
});

let products = [];


export default async (req: IncomingMessage, res: ServerResponse) => {


  let tableName = 'products';
  let params = {
    TableName: tableName
  };
  let items = [];

  products = dynamodb.scan(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      for (let i in data.Items)
        items.push(data.Items[i])

      // console.log('dataresponse', '\n', data)
      // console.log('AWS-DynamoDB : table : items: ', '\n', items)
      // res.contentType = 'application/json';
      // res.send(items);
      console.log('i did it');
    }
    return items;
  });
  console.log(products.value)
  // return {
  //   items: true
  // }

  // res.statusCode = 200
  // res.end('Works!')
}