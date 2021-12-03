import config from '../../config.js';
import AWS from 'aws-sdk';

AWS.config.update(config.aws_remote_config)

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'eu-central-1',
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com"
});

let items = [];

export default async (req, res) => {
    let tableName = 'products';
    let params = {
        TableName: tableName
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            if (items.length > 0) {
                items = []
            }
            for (let i in data.Items)
                items.push(JSON.stringify(data.Items[i]));

            // console.log('dataresponse', '\n', data)
            // console.log('AWS-DynamoDB : table : items: ', '\n', items)
            // res.contentType = 'application/json';
            // res.send(items);
            console.log('i did it');
        }
        return items.items;
    });
    // console.log()
    return {
        items
    }
}