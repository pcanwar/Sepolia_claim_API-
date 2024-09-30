const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' });

exports.addUserIds = async (event) => {
  const userIds = [
    'aa4723test1', 'aa4723test11'
  ];

  for (const userId of userIds) {
    const params = {
      TableName: 'UsersTable',
      Item: {
        userId: { S: userId },
        claimed: { BOOL: false }
      }
    };

    try {
      const command = new PutItemCommand(params);
      await dynamoDbClient.send(command);
      console.log(`User ID ${userId} added.`);
    } catch (error) {
      console.error(`Error adding user ID ${userId}: `, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Successfully added' }),
  };
};
